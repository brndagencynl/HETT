
export const generateConfigHash = (config: any): string => {
    if (!config) return '';
    // simple stable stringify
    const keys = Object.keys(config).sort();
    const str = keys.map(k => `${k}:${JSON.stringify(config[k])}`).join('|');

    // simple hash
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
};
