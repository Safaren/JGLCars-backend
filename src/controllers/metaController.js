const { Prisma } = require("@prisma/client");

exports.getEnums = async (req, res) => {
  try {
    const enums = Prisma.dmmf.datamodel.enums;

    const result = {};

    enums.forEach((en) => {
      result[en.name] = en.values; // valores del enum en bruto
    });

    res.json(result);
  } catch (error) {
    console.error("❌ Error obteniendo enums:", error);
    res.status(500).json({ error: "No se pudieron cargar los enums" });
  }
};
