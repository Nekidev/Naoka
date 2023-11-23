import fs from "fs";

export class InternalAPI {
    get config(): object {
        try {
            return JSON.parse(fs.readFileSync("config.json", "utf-8"));
        } catch (e: any) {
            if (e.code == "ENOENT") {
                fs.writeFileSync("config.json", "{}", "utf-8");
            }

            console.error("Could not read config file! Error:", e);
            alert("Could not read config file! Error: " + e);
            return {};
        }
    }

    set config(value: object) {
        fs.writeFileSync(
            "config.json",
            JSON.stringify(value, null, 2),
            "utf-8"
        );
    }

    constructor() {
        if (!fs.existsSync("config.json")) {
            fs.writeFileSync("config.json", "{}", "utf-8");
        }
    }
}
