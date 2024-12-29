/**
 * Creates a NLP manager
 */
class NLPManager{
    #stopwords;
    /**
     * Creates an NLP manager
     * @param {String[]} languages Dictionary language
     * @param {String} txt String to check
     * @param {JSON} [options={}] Options for each method
     * @returns {NLPManager} 
     */
    constructor(languages,options={}){

        this.#stopwords = {};
        this.lang = '';
        this.selectedLang = '';


        NLPManager.prototype.txt = '';
    
        if(!window.Tokenizr) throw new ReferenceError('utils/tokenizr.min.js must be active');
        if(!window.text) throw new ReferenceError('utils/text.js must be active');

        if(!options.hasOwnProperty('normalize'))
            options['normalize'] = 'nfc';
        if(!options.hasOwnProperty('tokenizer'))
            options['tokenizer'] = {
                patterns: [
                    /"((?:\\"|[^\r\n])*)"/,
                    /([£$€]\d+(?:,\d{3})*(?:\.\d{1,2})?)/,
                    /\d+(?:\.\d+)?%/,
                    /[+-]?[0-9]+/,
                    /\b[\w]{2,}\b/,
                    /\/\/[^\r\n]*\r?\n/,
                    /[ \t\r\n]+/,
                    /./
                ],
                callback: [
                    (ctx, match) => {
                        ctx.accept("quote",match[1].replace(/\\"/g, "\""));
                    },
                    (ctx,match)=>{
                        ctx.accept('money');
                    },
                    (ctx,match)=>{
                        ctx.accept('percentage');
                    },
                    (ctx, match) => {
                        ctx.accept("number", parseInt(match[0]))
                    },
                    (ctx, match) => {
                        ctx.accept("word");
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
        if(!options.hasOwnProperty('nlu')){
            options['nlu'] = {
                useNoneFeature: true
            };
        }else{
            if(!options.nlu.hasOwnProperty('useNoneFeature')) options.nlu.useNoneFeature = true;
        }
        
        NLPManager.prototype.opt = options;
        NLPManager.prototype.nlp = {};
        NLPManager.prototype.results = {saved: 0, output: []};
        let sw = [];
        languages.forEach(l=>{
            this.#setLang(l).#init();
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

            sw = this.#setLang(l).listStopwords();
            NLPManager.prototype.nlp[l] = {stopwords: sw, documents: [], answers: []};
        });

        NLPManager.prototype.tokens = [];
        return NLPManager.prototype;
    }


    #init(){
        const xhr = new XMLHttpRequest();
        xhr.onload = ()=>{
            if(xhr.status==200&&xhr.readyState==4){
                this.#stopwords[this.lang] = xhr.responseText.split(/\r\n|\n/g);
            }
        }
        xhr.open('GET',`./stopwords/${this.lang}.txt`,false);
        xhr.send();
    }

    #setLang(lang){
        this.lang = lang;
        if(!this.#stopwords.hasOwnProperty(lang)) this.#stopwords[lang] = [];
        return this;
    }
    /**
     * Add stopword to dictionary
     * @param  {...String} items 
     */
    addStopwords(...items){ 
        items.forEach(i=>{
            this.#stopwords[this.lang].push(i);
        });
    }
    /**
     * Remove stopwords from list
     * @param  {...String} items Words to remove
     */
    removeStopwords(...items){
        items.forEach(i=>{
            this.#stopwords[this.lang] = this.#stopwords[this.lang].filter(e=>e.toLocaleLowerCase()!==i.toLocaleLowerCase());
        });
    }

    /**
     * Lists the stopwords
     * @returns {String[]}
     */
    listStopwords(){
        return this.#stopwords[this.lang];
    }



    /**
     * Normalizes the string
     * @param {String|null} [msg=null] Message to normalize
     * @return {NLPManager}
     */
    normalize(msg=null){
        if(msg){
            return msg.normalize(this.opt.normalize.toLocaleUpperCase());
        }else{
            this.txt = this.txt.normalize(this.opt.normalize.toLocaleUpperCase());
            return NLPManager.prototype;
        }
    }

    /**
     * Tokenizes the string
     * @param {String|null} [msg=null] Message to tokenize
     * @api https://github.com/rse/tokenizr
     * @returns {NLPManager}
     */
    tokenizer(msg=null){
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
        lexer.input((msg ? msg : this.txt));
        lexer.debug(false);
        lexer.tokens().forEach((token) => {
            setTokens.push(token.toJSON());
        });
        setTokens.map(e=>{
            e.value = e.value.replace(/^"|"$/g,'');
            e.text = e.text.replace(/^"|"$/g,'');
        });
        setTokens.forEach(t=>{
            tokens.push(t);
        });
        if(!msg){
            this.tokens = tokens;
            return NLPManager.prototype;
        }else return tokens;
    }

    /**
     * Add a document to the AI
     * @param {String} lang Language dictionary to target
     * @param {String} utterance Message to look for
     * @param {String} intent modal to look for.
     * @returns {NLPManager}
     */
    addDocument(lang, utterance, intent){
        this.nlp[lang]['documents'].push({'utterance':utterance, 'intent': intent});
        return NLPManager.prototype;
    }
    /**
     * Add answers to the AI
     * @param {String} lang Language dictionary to target
     * @param {String} intent modal to look for
     * @param {String} utterance Message to return
     */
    addAnswer(lang,intent,utterance){
        this.nlp[lang]['answers'].push({'utterance':utterance, 'intent': intent});
        return NLPManager.prototype;
    }

    train(){
        this.results['output']['sentiment'] = {};
        this.results['output']['entities'] = [];
        this.results['output']['classifications'] = [];
        setTimeout(()=>{
            this.results['output']['utterance'] = this.txt;
            this.tokens = this.tokenizer(this.normalize(this.txt));
            const stopwords = [];
            Object.keys(this.nlp).forEach(k=>{
                if(!stopwords.some(sub=>sub.includes(...this.nlp[k].stopwords)))
                    stopwords.push(this.nlp[k].stopwords);
            });
            
            this.tokens = this.tokens.filter(k=>{
                let isStopWord = false
                stopwords.forEach(i=>{
                    if(i.includes(k.value)) isStopWord = true;
                });
                return k.type!=='char'&&!isStopWord&&k.value!=='';
            });

            console.log(this.tokens);



        },100);
    }
    save(){
        this.results['saved'] = 1;
    }
    process(lang,txt){
        this.txt = txt;

        const nlp = this.nlp[lang],
        tokens = this.tokens,
        iso = `${lang}-${navigator.languages[0].substring(3)}`;
        this.results['output']['sentiment']['language'] = (new Intl.Locale(iso)).language.substring(0,2);

        if(this.results.saved&&Object.keys(this.results['output']).length>0) return {
            utterance: this.results['output']['utterance'],
            classifications: this.results['output']['classifications'],
            sentiment: this.results['output']['sentiment'],
            entities: this.results['output']['entities'],
        };
        else throw new Error('Training has not been accessed');
    }

}
window.nlp = NLPManager;