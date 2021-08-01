export default (rawJSON: string) => {
    try {
        // Try and parse the JSON
        const parsed = JSON.parse(rawJSON);

        // Check that the object doesnt contain invalid types
        for (let key of Object.keys(parsed)) {
            const type = typeof parsed[key];
            if (type !== "number" && type !== "string" && type !== "boolean")
                return false;
        }

        // If all checks passed then return true
        return true;
    } catch {
        // Return false
        return false;
    }
};
