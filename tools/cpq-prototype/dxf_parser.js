(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.CpqDxfParser = api;
})(typeof self !== "undefined" ? self : globalThis, function () {
  function round(value, digits = 3) {
    if (!Number.isFinite(value)) return null;
    const factor = 10 ** digits;
    return Math.round(value * factor) / factor;
  }

  function pairsFromText(text) {
    const lines = String(text || "").replace(/^\uFEFF/, "").split(/\r?\n/).map((line) => line.trim());
    const pairs = [];
    for (let i = 0; i + 1 < lines.length; i += 2) {
      const code = Number(lines[i]);
      if (Number.isInteger(code)) pairs.push({ code, value: lines[i + 1] });
    }
    return pairs;
  }

  function numberGroup(entity, code, fallback = null) {
    const group = entity.groups.find((item) => item.code === code);
    if (!group) return fallback;
    const parsed = Number(group.value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function entitySlices(pairs) {
    let inEntities = false;
    let sectionDepth = 0;
    const entities = [];
    let current = null;

    for (const pair of pairs) {
      if (pair.code === 0 && pair.value === "SECTION") {
        sectionDepth += 1;
        continue;
      }
      if (pair.code === 2 && pair.value === "ENTITIES" && sectionDepth > 0) {
        inEntities = true;
        continue;
      }
      if (!inEntities) continue;
      if (pair.code === 0 && pair.value === "ENDSEC") break;

      if (pair.code === 0) {
        if (current) entities.push(current);
        current = { type: pair.value, groups: [] };
      } else if (current) {
        current.groups.push(pair);
      }
    }
    if (current) entities.push(current);
    return entities;
  }

  function insunitsScale(pairs) {
    const index = pairs.findIndex((pair) => pair.code === 9 && pair.value === "$INSUNITS");
    if (index < 0) return { scale: 1, units: "not declared; interpreted as millimetres" };
    const valueGroup = pairs.slice(index + 1).find((pair) => pair.code === 70);
    const unit = valueGroup ? Number(valueGroup.value) : null;
    const scales = { 1: 25.4, 2: 304.8, 4: 1, 5: 10, 6: 1000 };
    if (!scales[unit]) return { scale: 1, units: "unsupported or undeclared; interpreted as millimetres" };
    const names = { 1: "inches", 2: "feet", 4: "millimetres", 5: "centimetres", 6: "metres" };
    return { scale: scales[unit], units: names[unit] };
  }

  function boxAdd(box, x, y) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    box.minX = Math.min(box.minX, x);
    box.minY = Math.min(box.minY, y);
    box.maxX = Math.max(box.maxX, x);
    box.maxY = Math.max(box.maxY, y);
  }

  function emptyBox() {
    return { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  }

  function lineData(entity) {
    const x1 = numberGroup(entity, 10);
    const y1 = numberGroup(entity, 20);
    const x2 = numberGroup(entity, 11);
    const y2 = numberGroup(entity, 21);
    if ([x1, y1, x2, y2].some((value) => value === null)) return null;
    return { kind: "line", x1, y1, x2, y2, lengthMm: Math.hypot(x2 - x1, y2 - y1), hole: false };
  }

  function lwPolylineData(entity) {
    const xs = entity.groups.filter((group) => group.code === 10).map((group) => Number(group.value));
    const ys = entity.groups.filter((group) => group.code === 20).map((group) => Number(group.value));
    const count = Math.min(xs.length, ys.length);
    if (count < 2) return null;
    const points = [];
    for (let i = 0; i < count; i += 1) points.push({ x: xs[i], y: ys[i] });
    const flags = numberGroup(entity, 70, 0) || 0;
    const closed = (flags & 1) === 1;
    let lengthMm = 0;
    for (let i = 0; i < points.length - 1; i += 1) lengthMm += Math.hypot(points[i + 1].x - points[i].x, points[i + 1].y - points[i].y);
    if (closed) lengthMm += Math.hypot(points[0].x - points[points.length - 1].x, points[0].y - points[points.length - 1].y);
    const hasBulge = entity.groups.some((group) => group.code === 42 && Number(group.value) !== 0);
    return { kind: "polyline", points, closed, lengthMm, hole: false, hasBulge };
  }

  function circleData(entity) {
    const x = numberGroup(entity, 10);
    const y = numberGroup(entity, 20);
    const radius = numberGroup(entity, 40);
    if ([x, y, radius].some((value) => value === null) || radius <= 0) return null;
    return { kind: "circle", x, y, radius, diameter: radius * 2, lengthMm: 2 * Math.PI * radius, hole: false };
  }

  function arcData(entity) {
    const x = numberGroup(entity, 10);
    const y = numberGroup(entity, 20);
    const radius = numberGroup(entity, 40);
    const start = numberGroup(entity, 50);
    const end = numberGroup(entity, 51);
    if ([x, y, radius, start, end].some((value) => value === null) || radius <= 0) return null;
    let delta = end - start;
    if (!Number.isFinite(delta)) return null;
    delta = ((delta % 360) + 360) % 360;
    if (delta === 0) delta = 360;
    return { kind: "arc", x, y, radius, start, end, lengthMm: 2 * Math.PI * radius * (delta / 360), hole: false };
  }

  function parseDxf(text) {
    const warnings = [];
    if (!text || !String(text).trim()) return { ok: false, error: "DXF file is empty.", warnings };
    if (!/ENTITIES/i.test(text)) return { ok: false, error: "No ENTITIES section found. Binary or unsupported DXF files are outside this parser.", warnings };

    const pairs = pairsFromText(text);
    const entities = entitySlices(pairs);
    if (!entities.length) return { ok: false, error: "No drawable entities found in the ENTITIES section.", warnings };

    const unit = insunitsScale(pairs);
    if (unit.units.includes("interpreted")) warnings.push(`DXF units ${unit.units}.`);
    const geometry = [];
    const unsupported = new Set();

    for (const entity of entities) {
      let item = null;
      if (entity.type === "LINE") item = lineData(entity);
      else if (entity.type === "LWPOLYLINE") item = lwPolylineData(entity);
      else if (entity.type === "CIRCLE") item = circleData(entity);
      else if (entity.type === "ARC") item = arcData(entity);
      else if (!["POINT", "TEXT", "MTEXT", "DIMENSION", "HATCH", "ATTRIB", "ATTDEF", "SEQEND"].includes(entity.type)) unsupported.add(entity.type);
      if (item) geometry.push(item);
    }

    if (!geometry.length) return { ok: false, error: "No supported LINE, LWPOLYLINE, CIRCLE or ARC geometry found.", warnings };
    if (unsupported.size) warnings.push(`Unsupported entities ignored: ${Array.from(unsupported).join(", ")}.`);
    if (geometry.some((item) => item.hasBulge)) warnings.push("LWPOLYLINE bulge segments were treated as straight chords; curved contours require manual geometry review.");

    const scale = unit.scale;
    for (const item of geometry) item.lengthMm *= scale;
    const box = emptyBox();
    const circles = [];
    const contourItems = [];

    for (const item of geometry) {
      if (item.kind === "line") {
        boxAdd(box, item.x1 * scale, item.y1 * scale);
        boxAdd(box, item.x2 * scale, item.y2 * scale);
        contourItems.push(item);
      } else if (item.kind === "polyline") {
        for (const point of item.points) boxAdd(box, point.x * scale, point.y * scale);
        contourItems.push(item);
      } else if (item.kind === "circle") {
        boxAdd(box, (item.x - item.radius) * scale, (item.y - item.radius) * scale);
        boxAdd(box, (item.x + item.radius) * scale, (item.y + item.radius) * scale);
        circles.push(item);
      } else if (item.kind === "arc") {
        boxAdd(box, (item.x - item.radius) * scale, (item.y - item.radius) * scale);
        boxAdd(box, (item.x + item.radius) * scale, (item.y + item.radius) * scale);
        contourItems.push(item);
      }
    }

    if (!Number.isFinite(box.minX)) return { ok: false, error: "Could not calculate a bounding box from the supported geometry.", warnings };
    const widthMm = (box.maxX - box.minX);
    const lengthMm = (box.maxY - box.minY);
    if (widthMm <= 0 || lengthMm <= 0) return { ok: false, error: "Geometry bounding box has zero width or length.", warnings };

    const holeLimit = Math.min(widthMm, lengthMm) * 0.5;
    let holes = [];
    if (circles.length === 1 && !contourItems.length) {
      contourItems.push(circles[0]);
    } else {
      holes = circles.filter((circle) => circle.diameter * scale <= holeLimit);
      const contourCircles = circles.filter((circle) => !holes.includes(circle));
      contourItems.push(...contourCircles);
      if (contourCircles.length && contourItems.length > contourCircles.length) warnings.push("Large circular entities were treated as contour geometry; verify whether they are holes or cutouts.");
    }

    const outerPerimeterMm = contourItems.reduce((sum, item) => sum + item.lengthMm, 0);
    const holePerimeterMm = holes.reduce((sum, item) => sum + item.lengthMm, 0);
    if (!outerPerimeterMm) warnings.push("No outer contour entities could be separated from hole geometry; verify the drawing manually.");
    if (circles.length && !holes.length && contourItems.length) warnings.push("Circular entities were not confidently classified as holes; verify drilling count manually.");

    const holeDiameters = holes.map((hole) => hole.diameter * scale).sort((a, b) => a - b);
    const result = {
      ok: true,
      units: unit.units,
      entityCount: entities.length,
      supportedEntityCount: geometry.length,
      widthMm: round(widthMm, 3),
      lengthMm: round(lengthMm, 3),
      partAreaM2: round((widthMm * lengthMm) / 1_000_000, 5),
      outerPerimeterM: round(outerPerimeterMm / 1000, 4),
      cuttingPerimeterM: round((outerPerimeterMm + holePerimeterMm) / 1000, 4),
      holesPerPart: holes.length,
      holeDiameterMm: holeDiameters.length ? round(holeDiameters[0], 3) : null,
      holeDiametersMm: holeDiameters.map((value) => round(value, 3)),
      warnings,
      geometryConfidence: "basic-dxf-bounding-box",
      requiresManualGeometryReview: true
    };
    return result;
  }

  return { parseDxf };
});
