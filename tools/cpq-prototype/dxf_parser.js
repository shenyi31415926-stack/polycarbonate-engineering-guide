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

  function polygonAreaMm2(points, scale) {
    const origin = points[0];
    let twiceArea = 0;
    for (let i = 0; i < points.length; i += 1) {
      const next = points[(i + 1) % points.length];
      const x = points[i].x - origin.x;
      const y = points[i].y - origin.y;
      const nextX = next.x - origin.x;
      const nextY = next.y - origin.y;
      twiceArea += x * nextY - nextX * y;
    }
    return Math.abs(twiceArea) * scale * scale / 2;
  }

  function pointInPolygon(point, points) {
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
      const intersects = (points[i].y > point.y) !== (points[j].y > point.y)
        && point.x < ((points[j].x - points[i].x) * (point.y - points[i].y)) / (points[j].y - points[i].y) + points[i].x;
      if (intersects) inside = !inside;
    }
    return inside;
  }

  function endpointKey(x, y) {
    return `${x.toFixed(5)},${y.toFixed(5)}`;
  }

  function distancePointToSegment(point, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lengthSquared = dx * dx + dy * dy;
    if (!lengthSquared) return Math.hypot(point.x - a.x, point.y - a.y);
    const t = Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSquared));
    return Math.hypot(point.x - (a.x + t * dx), point.y - (a.y + t * dy));
  }

  function circleFullyInsidePolygon(circle, points) {
    if (!pointInPolygon(circle, points)) return false;
    for (let i = 0; i < points.length; i += 1) {
      const next = points[(i + 1) % points.length];
      if (distancePointToSegment(circle, points[i], next) <= circle.radius) return false;
    }
    return true;
  }

  function orientation(a, b, c) {
    const value = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
    const epsilon = 1e-10;
    if (Math.abs(value) < epsilon) return 0;
    return value > 0 ? 1 : -1;
  }

  function onSegment(a, b, point) {
    const epsilon = 1e-10;
    return point.x >= Math.min(a.x, b.x) - epsilon && point.x <= Math.max(a.x, b.x) + epsilon
      && point.y >= Math.min(a.y, b.y) - epsilon && point.y <= Math.max(a.y, b.y) + epsilon;
  }

  function segmentsIntersect(a1, a2, b1, b2) {
    const o1 = orientation(a1, a2, b1);
    const o2 = orientation(a1, a2, b2);
    const o3 = orientation(b1, b2, a1);
    const o4 = orientation(b1, b2, a2);
    if (o1 !== o2 && o3 !== o4) return true;
    if (o1 === 0 && onSegment(a1, a2, b1)) return true;
    if (o2 === 0 && onSegment(a1, a2, b2)) return true;
    if (o3 === 0 && onSegment(b1, b2, a1)) return true;
    if (o4 === 0 && onSegment(b1, b2, a2)) return true;
    return false;
  }

  function polygonIsSimple(points) {
    if (points.some((point, index) => endpointKey(point.x, point.y) === endpointKey(points[(index + 1) % points.length].x, points[(index + 1) % points.length].y))) return false;
    for (let i = 0; i < points.length; i += 1) {
      const a1 = points[i];
      const a2 = points[(i + 1) % points.length];
      for (let j = i + 1; j < points.length; j += 1) {
        if (j === i + 1 || (i === 0 && j === points.length - 1)) continue;
        const b1 = points[j];
        const b2 = points[(j + 1) % points.length];
        if (segmentsIntersect(a1, a2, b1, b2)) return false;
      }
    }
    return true;
  }

  function circlesOverlap(circles) {
    for (let i = 0; i < circles.length; i += 1) {
      for (let j = i + 1; j < circles.length; j += 1) {
        const distance = Math.hypot(circles[i].x - circles[j].x, circles[i].y - circles[j].y);
        if (distance < circles[i].radius + circles[j].radius) return true;
      }
    }
    return false;
  }

  function chainLineLoop(lines) {
    if (!lines.length || lines.some((line) => line.lengthMm <= 0)) return null;
    const degree = new Map();
    for (const line of lines) {
      for (const point of [{ x: line.x1, y: line.y1 }, { x: line.x2, y: line.y2 }]) {
        const key = endpointKey(point.x, point.y);
        degree.set(key, (degree.get(key) || 0) + 1);
      }
    }
    if (Array.from(degree.values()).some((count) => count !== 2)) return null;

    const unused = new Set(lines.map((_, index) => index));
    const first = lines[0];
    const start = { x: first.x1, y: first.y1 };
    const points = [start, { x: first.x2, y: first.y2 }];
    unused.delete(0);

    while (unused.size) {
      const end = points[points.length - 1];
      const endKey = endpointKey(end.x, end.y);
      let nextIndex = null;
      for (const index of unused) {
        const line = lines[index];
        if (endpointKey(line.x1, line.y1) === endKey || endpointKey(line.x2, line.y2) === endKey) {
          nextIndex = index;
          break;
        }
      }
      if (nextIndex === null) return null;
      const line = lines[nextIndex];
      const nextPoint = endpointKey(line.x1, line.y1) === endKey
        ? { x: line.x2, y: line.y2 }
        : { x: line.x1, y: line.y1 };
      points.push(nextPoint);
      unused.delete(nextIndex);
    }

    const last = points[points.length - 1];
    if (endpointKey(last.x, last.y) !== endpointKey(start.x, start.y)) return null;
    points.pop();
    if (points.length < 3) return null;
    return { kind: "polyline", points, closed: true, lengthMm: lines.reduce((sum, line) => sum + line.lengthMm, 0), hole: false, hasBulge: false };
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

    const closedPolyline = contourItems.length === 1
      && contourItems[0].kind === "polyline"
      && contourItems[0].closed
      && !contourItems[0].hasBulge
      && contourItems[0].points.length >= 3
      ? contourItems[0]
      : null;
    let lineLoop = null;
    if (!closedPolyline && contourItems.length >= 3 && contourItems.every((item) => item.kind === "line")) {
      lineLoop = chainLineLoop(contourItems);
      if (!lineLoop) warnings.push("LINE entities could not be reconstructed into one simple closed contour; bounding-box area was retained.");
    }
    const contourCandidate = closedPolyline || lineLoop;
    const simpleContour = contourCandidate && polygonIsSimple(contourCandidate.points) ? contourCandidate : null;
    if (contourCandidate && !simpleContour) warnings.push("Closed contour self-intersects or contains duplicate/zero-length vertices; bounding-box area was retained.");

    let fullyInsideHoles = [];
    let circularHoleAreaUncertain = false;
    if (simpleContour && holes.length) {
      const insideHoles = holes.filter((hole) => pointInPolygon(hole, simpleContour.points));
      const outsideHoles = holes.filter((hole) => !insideHoles.includes(hole));
      holes = insideHoles;
      fullyInsideHoles = insideHoles.filter((hole) => circleFullyInsidePolygon(hole, simpleContour.points));
      circularHoleAreaUncertain = fullyInsideHoles.length !== insideHoles.length;
      if (outsideHoles.length) warnings.push(`${outsideHoles.length} circular entit${outsideHoles.length === 1 ? "y was" : "ies were"} outside the closed contour and excluded from hole metrics.`);
      if (circularHoleAreaUncertain) warnings.push("At least one circular entity touches or crosses the contour boundary; net contour area was not used because the cutout area cannot be determined by circular-hole subtraction.");
    }

    const overlappingAreaHoles = circlesOverlap(fullyInsideHoles);
    if (overlappingAreaHoles) warnings.push("Overlapping circular holes detected; net contour area was not used because their union area cannot be represented by simple subtraction.");

    const outerPerimeterMm = contourItems.reduce((sum, item) => sum + item.lengthMm, 0);
    const holePerimeterMm = holes.reduce((sum, item) => sum + item.lengthMm, 0);
    if (!outerPerimeterMm) warnings.push("No outer contour entities could be separated from hole geometry; verify the drawing manually.");
    if (circles.length && !holes.length && contourItems.length) warnings.push("Circular entities were not confidently classified as holes; verify drilling count manually.");

    const boundingBoxAreaMm2 = widthMm * lengthMm;
    let partAreaMm2 = boundingBoxAreaMm2;
    let areaSource = "bounding-box";
    if (simpleContour && !circularHoleAreaUncertain && !overlappingAreaHoles) {
      const contourAreaMm2 = polygonAreaMm2(simpleContour.points, scale);
      const holesAreaMm2 = fullyInsideHoles.reduce((sum, hole) => sum + Math.PI * (hole.radius * scale) ** 2, 0);
      const netAreaMm2 = contourAreaMm2 - holesAreaMm2;
      if (contourAreaMm2 > 0 && netAreaMm2 > 0) {
        partAreaMm2 = netAreaMm2;
        areaSource = "simple-closed-contour-minus-circular-holes";
      } else {
        warnings.push("Closed-contour area could not be calculated reliably; bounding-box area was used instead.");
      }
    }

    const holeDiameters = holes.map((hole) => hole.diameter * scale).sort((a, b) => a - b);
    const result = {
      ok: true,
      units: unit.units,
      entityCount: entities.length,
      supportedEntityCount: geometry.length,
      widthMm: round(widthMm, 3),
      lengthMm: round(lengthMm, 3),
      partAreaM2: round(partAreaMm2 / 1_000_000, 5),
      boundingBoxAreaM2: round(boundingBoxAreaMm2 / 1_000_000, 5),
      areaSource,
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
