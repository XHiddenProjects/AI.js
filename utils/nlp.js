/**
 * NLP Stopwords
 */
class NLPStopwords{
    /**
     * 
     * @param {String} lang Language to set
     */
    constructor(){
        this.stopwords = {};
        this.lang = '';
    }
    setLang(lang){
        this.lang = lang;
        if(!this.stopwords.hasOwnProperty(lang)) this.stopwords[lang] = [];
        return this;
    }
    /**
     * Add stopword to dictionary
     * @param  {...String} items 
     */
    addStopwords(...items){ 
        items.forEach(i=>{
            this.stopwords[this.lang].push(i);
        });
    }
    removeStopwords(...items){
        items.forEach(i=>{
            this.stopwords[this.lang] = this.stopwords[this.lang].filter(e=>e.toLocaleLowerCase()!==i.toLocaleLowerCase());
        });
    }
    /**
     * Lists the stopwords
     * @returns {String[]}
     */
    listStopwords(){
        return this.stopwords[this.lang];
    }
}
/**
 * Creates a NLP manager
 */
class NLPManager extends NLPStopwords{
    /**
     * Creates an NLP manager
     * @param {String[]} languages Dictionary language
     * @param {String} txt String to check
     * @param {JSON} [options={}] Options for each method
     */
    constructor(languages,txt,options={}){
        super();
        this.txt = txt;

        if(!options.hasOwnProperty('normalize'))
            options['normalize'] = 'nfc';
        if(!options.hasOwnProperty('tokenizer'))
            options['tokenizer'] = {
                patterns: [
                    /[+-]?[0-9]+/,
                    /"((?:\\"|[^\r\n])*)"/,
                    /\/\/[^\r\n]*\r?\n/,
                    /[ \t\r\n]+/,
                    /./
                ],
                callback: [
                    (ctx, match) => {
                        ctx.accept("number", parseInt(match[0]))
                    },
                    (ctx, match) => {
                        ctx.accept("string", match[1].replace(/\\"/g, "\""))
                    },
                    (ctx, match) => {
                        ctx.ignore()
                    },
                    (ctx, match) => {
                        ctx.ignore()
                    },
                    (ctx, match) => {
                        ctx.accept("char")
                    }
                ]
            };
        this.opt = options;
        this.npl = {};
        let sw = [];
        languages.forEach(l=>{
            if(l=='en')
                this.setLang(l).addStopwords('i','me','my','myself','we','our','ours','ourselves','you','your','yours','yourself','yourselves','he','him','his','himself','she','her','hers','herself','it','its','itself','they','them','their','theirs','themselves','what','which','who','whom','this','that','these','those','am','is','are','was','were','be','been','being','have','has','had','having','do','does','did','doing','a','an','the','and','but','if','or','because','as','until','while','of','at','by','for','with','about','against','between','into','through','during','before','after','above','below','to','from','up','down','in','out','on','off','over','under','again','further','then','once','here','there','when','where','why','how','all','any','both','each','few','more','most','other','some','such','no','nor','not','only','own','same','so','than','too','very','s','t','can','will','just','don','should','now');
            // UPDATE STOPWORDS
            if(options.hasOwnProperty('stopwords')){
                options['stopwords'].forEach((e,i)=>{
                    if(typeof e==='function')
                        e(this);
                    else
                        throw new TypeError(`Index ${i}: Must be a function`);
                });
            }
            // CLOSE STOPWORDS
            
            sw = this.setLang(l).listStopwords();
            this.npl[l] = {stopwords: sw};
        });

        
    }
    /**
     * Normalizes the string
     * @returns {String}
     */
    normalize(){
        this.txt = this.txt.normalize(this.opt.normalize.toLocaleUpperCase());
        return this.txt;
    }

    /**
     * Tokenizes the string
     * @param {RegExp[]} patterns 
     * @param {Function[]} callback 
     * @api https://github.com/rse/tokenizr
     * @returns {Array} Tokens
     */
    tokenizer(){
        const setTokens = [], 
        tokens = [],
        patterns = this.opt.tokenizer.patterns,
        callback = this.opt.tokenizer.callback;
        if(!window.Tokenizr) throw new ReferenceError("utils/tokenizr.min.js has not been loaded");
        const lexer = new window.Tokenizr();
        if(patterns.length==0||callback.length==0) throw new Error('You must have 1+ items');
        if(patterns.length!==callback.length)
            throw new RangeError('All 3 parameters must be the same amount of length');
        for(let i=0;i<patterns.length;i++)
            lexer.rule(patterns[i],callback[i]);
        lexer.input(this.txt);
        lexer.debug(false);
        lexer.tokens().forEach((token) => {
            setTokens.push(token.toJSON());
        });

        setTokens.forEach(e=>{
            e.value = e.value.replace(/^"|"$/g,'');
            if(e.value!=="\"\""){
                e.value.trim().split(' ').forEach(t=>{
                    tokens.push(t);
                })
                
            }
        });

        return tokens;
    }
    sanitize(tokens){
        Object.keys(this.npl).forEach(e=>{
        const v = this.npl[e];
        tokens = tokens.filter(t=>{
                if(t!=='')
                    return v['stopwords'].indexOf(t.toLowerCase()) == -1;
            });
        });
        return tokens;
    }
}
window.nlp = NLPManager;