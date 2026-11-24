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

# ---------- Ajustes de la web (textos de WhatsApp del equipo ATC) ----------
EXT = "Incluye color entero, francesa, efecto aurora, glazed o diseño básico."
LIBRE = "Precio para uñas libres de sistemas."
DETALLE = {
    "MNC001": "Limpieza profunda de cutículas, pulido, hidratación y esmaltado transparente con acabado brillante o color nude.",
    "MNC002": "Incluye color entero o francesa.",
    "MNC003": "Incluye color entero, francesa o diseño básico.",
    "MNC004": f"{EXT} Largo natural hasta el #3. {LIBRE}",
    "MNC005": f"{EXT} Largo natural hasta el #3. {LIBRE}",
    "MNC006": f"{EXT} Largo hasta el #3. {LIBRE}",
    "MNC007": f"{EXT} Largo hasta el #3. {LIBRE}",
    "MNC008": f"{EXT} Largo natural hasta el #3. {LIBRE}",
    "MNC009": f"{EXT} Largo hasta el #3. {LIBRE}",
    "MNC010": f"{EXT} Largo hasta el #3. {LIBRE}",
    "MNC011": f"{EXT} Largo hasta el #3. {LIBRE}",
    "MNC012": f"{EXT} Largo natural hasta el #3. {LIBRE}",
    "MNC013": f"Alargamiento express con tips completos de gel. Incluye color entero, francesa o diseño básico. {LIBRE}",
    "PDC001": "Limpieza profunda, hidratación y esmaltado transparente con acabado brillante o color nude.",
    "PDC002": "Incluye color entero o francesa.",
    "PDC003": "Incluye color entero, francesa o diseño básico.",
    "PDC004": EXT,
    "RTR001": "Retiro seguro del gel, limado suave y cuidado básico de la uña.",
    "RTR002": "Retiro del producto, limado, limpieza de cutículas y nutrición con aceite.",
    "RTR003": "Rebaje del producto, retiro cuidadoso, limado y pulido, limpieza de cutículas y nutrición con aceite.",
    "RTR004": "Rebaje del producto, retiro cuidadoso, limado y pulido, limpieza de cutículas y nutrición con aceite.",
    "RTR005": "Rebaje del producto, retiro cuidadoso, limado y pulido, limpieza de cutículas y nutrición con aceite.",
    "DSN001": "Color entero, francesa, efecto aurora, glazed o diseño básico. Sin costo adicional.",
    "DSN002": "Arte a mano alzada sencillo en algunas uñas: líneas, puntos, flores pequeñas, cromados o detalles dorados.",
    "DSN003": "Diseño elaborado en todas las uñas: 3D, pedrería, airbrush, pintura detallada o diseños personalizados.",
}
for c in ["RTQ001", "RTQ002", "RTQ003", "RTQ004", "RTQ005", "RTQ006", "RTQ007"]:
    DETALLE[c] = f"{EXT} Solo para mantenimiento de uñas con sistema previo (no incluye alargamiento)."
# El retoque cuesta lo mismo que el servicio de manicure del mismo sistema
RETOQUE_IGUAL = {"RTQ001": "MNC004", "RTQ002": "MNC005", "RTQ003": "MNC007", "RTQ004": "MNC008", "RTQ005": "MNC010", "RTQ006": "MNC011", "RTQ007": "MNC012"}
PACKS = {"PCK001": "Pack Glow", "PCK002": "Pack Uñas Bonitas", "PCK003": "Pack Glam & Care", "PCK004": "Pack Rubber Nails"}
PACK_DET = {
    "PCK001": "Manicure + pedicure detox: limpieza profunda, hidratación y esmaltado transparente o nude.",
    "PCK002": "Manicure + pedicure con esmaltado tradicional: color entero o francesa.",
    "PCK003": "Manicure + pedicure con esmaltado en gel: color entero, francesa o diseño básico.",
    "PCK004": "Manicure + pedicure con Rubber Gel: color entero, francesa, efecto aurora, glazed o diseño básico. Largo natural hasta el #3. Precio para uñas libres de sistemas.",
}
PACK_PARTES = {"PCK001": ("MNC001", "PDC001"), "PCK002": ("MNC002", "PDC002"), "PCK003": ("MNC003", "PDC003"), "PCK004": ("MNC004", "PDC004")}
idx = {x["codigo"]: x for x in servicios}
for x in servicios:
    if x["codigo"] in DETALLE: x["detalle"] = DETALLE[x["codigo"]]
    if x["codigo"] in RETOQUE_IGUAL: x["precio"] = idx[RETOQUE_IGUAL[x["codigo"]]]["precio"]
    if x["codigo"] in PACKS:
        x["nombre"] = PACKS[x["codigo"]]; x["detalle"] = PACK_DET[x["codigo"]]
        normal = sum(idx[c]["precio"] for c in PACK_PARTES[x["codigo"]])
        if normal > x["precio"]: x["precioAntes"] = normal  # es promoción: no se paga con tarjeta
out = {"grupos": [{"id": g, "nombre": n} for g, n, _ in GRUPOS], "servicios": servicios}
json.dump(out, open("src/data/servicios.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(len(servicios), "servicios")
