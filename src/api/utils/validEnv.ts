export default (rawJSON: string) => {
    try {
        // Try and parse the JSON
        const parsed = JSON.parse(rawJSON);

        // Check that the object doesnt contain invalid types **** Should I allow other types too ?
        for (let key of Object.keys(parsed)) {
            if (typeof parsed[key] !== "string") return false;
        }

        // If all checks passed then return true
        return true;
    } catch {
        // Return false
        return false;
    }
};
