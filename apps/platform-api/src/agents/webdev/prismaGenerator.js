"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePrismaSchema = generatePrismaSchema;
function toSingular(name) {
    if (name.endsWith("sses"))
        return name.slice(0, -2);
    if (name.endsWith("ies"))
        return name.slice(0, -3) + "y";
    if (name.endsWith("s") && !name.endsWith("ss"))
        return name.slice(0, -1);
    return name;
}
function toCamel(str) {
    return str.charAt(0).toLowerCase() + str.slice(1);
}
function pluralize(name) {
    if (name.endsWith("s"))
        return name.toLowerCase();
    return name.toLowerCase() + "s";
}
function generatePrismaSchema(plan) {
    var schema = "\ngenerator client {\n  provider = \"prisma-client-js\"\n}\n\ndatasource db {\n  provider = \"postgresql\"\n  url      = env(\"DATABASE_URL\")\n}\n";
    var modelMap = new Map();
    //
    // 1️⃣ Normalize and register models
    //
    for (var _i = 0, _a = plan.entities; _i < _a.length; _i++) {
        var entity = _a[_i];
        var cleanName = toSingular(entity.name);
        modelMap.set(cleanName, __assign(__assign({}, entity), { name: cleanName, inverseRelations: [] }));
    }
    //
    // 2️⃣ Build inverse metadata (ONLY for many-to-one & one-to-one)
    //
    for (var _b = 0, _c = modelMap.values(); _b < _c.length; _b++) {
        var entity = _c[_b];
        for (var _d = 0, _e = entity.relations || []; _d < _e.length; _d++) {
            var rel = _e[_d];
            var targetName = toSingular(rel.target);
            var target = modelMap.get(targetName);
            if (!target)
                continue;
            var relationName = "".concat(entity.name, "_").concat(targetName);
            if (rel.type === "many-to-one") {
                target.inverseRelations.push({
                    field: pluralize(entity.name),
                    type: "".concat(entity.name, "[]"),
                    relationName: relationName
                });
            }
            if (rel.type === "one-to-one") {
                target.inverseRelations.push({
                    field: toCamel(entity.name),
                    type: "".concat(entity.name, "?"),
                    relationName: relationName
                });
            }
        }
    }
    //
    // 3️⃣ Build schema
    //
    for (var _f = 0, _g = modelMap.values(); _f < _g.length; _f++) {
        var entity = _g[_f];
        schema += "\nmodel ".concat(entity.name, " {\n");
        // ID
        schema += "  id Int @id @default(autoincrement())\n";
        // Business fields
        for (var _h = 0, _j = entity.fields || []; _h < _j.length; _h++) {
            var field = _j[_h];
            var name_1 = field.name.toLowerCase();
            if (name_1 === "id")
                continue;
            if (name_1.endsWith("id"))
                continue;
            schema += "  ".concat(field.name, " ").concat(field.type, "\n");
        }
        // Forward relations
        var writtenFields = new Set();
        // After writing ID and business fields
        writtenFields.add("id");
        for (var _k = 0, _l = entity.fields || []; _k < _l.length; _k++) {
            var field = _l[_k];
            writtenFields.add(field.name);
        }
        // Forward relations
        for (var _m = 0, _o = entity.relations || []; _m < _o.length; _m++) {
            var rel = _o[_m];
            var targetName = toSingular(rel.target);
            var relationName = "".concat(entity.name, "_").concat(targetName);
            var fk = toCamel(targetName) + "Id";
            if (rel.type === "many-to-one") {
                schema += "  ".concat(fk, " Int\n");
                schema += "  ".concat(toCamel(targetName), " ").concat(targetName, " @relation(\"").concat(relationName, "\", fields: [").concat(fk, "], references: [id])\n");
                writtenFields.add(fk);
                writtenFields.add(toCamel(targetName));
            }
            if (rel.type === "one-to-one") {
                schema += "  ".concat(fk, " Int @unique\n");
                schema += "  ".concat(toCamel(targetName), " ").concat(targetName, "? @relation(\"").concat(relationName, "\", fields: [").concat(fk, "], references: [id])\n");
                writtenFields.add(fk);
                writtenFields.add(toCamel(targetName));
            }
        }
        // Inverse relations
        for (var _p = 0, _q = entity.inverseRelations || []; _p < _q.length; _p++) {
            var inv = _q[_p];
            if (!writtenFields.has(inv.field)) {
                schema += "  ".concat(inv.field, " ").concat(inv.type, " @relation(\"").concat(inv.relationName, "\")\n");
                writtenFields.add(inv.field);
            }
        }
        schema += "}\n";
    }
    return schema;
}
