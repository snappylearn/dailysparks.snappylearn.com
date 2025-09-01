const Client = require("@replit/database");
const fs = require("fs");

const db = new Client(process.env.REPLIT_DB_URL);

(async () => {
  try {
    // Get all keys
    const listRes = await db.list();
    if (!listRes.ok) throw new Error("Failed to list keys");

    const keys = listRes.value; // ✅ actual array of keys

    let data = {};
    for (const key of keys) {
      const getRes = await db.get(key);
      if (getRes.ok) {
        data[key] = getRes.value; // ✅ actual stored value
      } else {
        console.error(`Could not fetch key: ${key}`, getRes.error);
      }
    }

    fs.writeFileSync("replit_db_export.json", JSON.stringify(data, null, 2));
    console.log("✅ Database exported to replit_db_export.json");
  } catch (err) {
    console.error("❌ Export failed:", err);
  }
})();
