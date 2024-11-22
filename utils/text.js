class text{
    constructor(){

    }
    /**
     * Gets the score for similar text
     * @param {Array} s1 String 1
     * @param {Array} s2 String 2
     * @returns {Number}
     */
    similarText(s1, s2) {
            // Tokenize and normalize strings
            const tokens1 = s1.map(s=>s.toLocaleLowerCase());
            const tokens2 = s2.map(s=>s.toLocaleLowerCase());
            // Create vectors from tokenized strings
            const vec1 = tokens1.reduce((acc, token) => ({ ...acc, [token]: (acc[token] || 0) + 1 }), {});
            const vec2 = tokens2.reduce((acc, token) => ({ ...acc, [token]: (acc[token] || 0) + 1 }), {});
        
            // Compute dot product
            let dotProduct = 0;
            for (const token in vec1) {
            dotProduct += vec1[token] * (vec2[token] || 0);
            }
        
            // Compute magnitudes
            const magnitude1 = Math.sqrt(Object.values(vec1).reduce((acc, freq) => acc + freq**2, 0));
            const magnitude2 = Math.sqrt(Object.values(vec2).reduce((acc, freq) => acc + freq**2, 0));
        
            // Compute Cosine Similarity
            const similarity = dotProduct / (magnitude1 * magnitude2);
        
            return similarity;
    }
}

window.text = text;