"""Convierte SERVICIOS_LADY_NAILS_2026.xlsx (hoja "Servicios") en src/data/servicios.json
Uso: python3 scripts/convertir_servicios.py SERVICIOS_LADY_NAILS_2026.xlsx
Mismos códigos que el punto de venta (MNC001, PCK001…)."""
import json, re, sys, openpyxl

xlsx = sys.argv[1]
ws = openpyxl.load_workbook(xlsx, data_only=True)["Servicios"]
filas = [dict(zip([c.value for c in ws[1]], r)) for r in ws.iter_rows(min_row=2, values_only=True) if r[0]]

# Grupos que se muestran en la web (Reparación y retiros "Propio" se ven en el studio)
GRUPOS = [
    ("manicure", "Manicure", lambda f: f["Categoría"] == "Manicure"),
    ("pedicure", "Pedicure", lambda f: f["Categoría"] == "Pedicure"),
    ("manipedi", "ManiPedi", lambda f: f["Categoría"] == "Packs"),
    ("retoque", "Retoques", lambda f: f["Categoría"] == "Retoque"),
    ("retiro", "Retiro de otro studio", lambda f: f["Categoría"] == "Retiro" and f["Subcategoría"] == "Otro studio"),
    ("diseno", "Diseño", lambda f: f["Categoría"] == "Diseño"),
]

def limpiar(n, cat):
    n = re.sub(r"\s*x1$", "", n.strip())
    for p in ("Manicure ", "Pedicure ", "Retoque ", "Retiro ", "Diseño "):
        if n.startswith(p) and cat != "Packs":
            n = n[len(p):]
    n = n.replace("c/tips", "con tips")
    return n[0].upper() + n[1:]

servicios, packs = [], {}
for f in filas:
    if str(f["Activo"]).upper() != "SI":
        continue
    for gid, gnom, ok in GRUPOS:
        if not ok(f):
            continue
        if gid == "manipedi":
            p = packs.setdefault(f["Código"], {"codigo": f["Código"], "grupo": gid, "nombre": f["Tipo"], "precio": float(f["Precio"]),
                                               "duracion": 0, "sub": f["Subcategoría"], "incluye": []})
            p["duracion"] += int(f["Duración (min)"] or 0)
            p["incluye"].append(re.sub(r"\s*x1$", "", f["Servicio"]))
        else:
            servicios.append({"codigo": f["Código"], "grupo": gid, "nombre": limpiar(f["Servicio"], f["Categoría"]),
                              "precio": float(f["Precio"]), "duracion": int(f["Duración (min)"] or 0), "sub": f["Subcategoría"]})
servicios += list(packs.values())
out = {"grupos": [{"id": g, "nombre": n} for g, n, _ in GRUPOS], "servicios": servicios}
json.dump(out, open("src/data/servicios.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(len(servicios), "servicios")
