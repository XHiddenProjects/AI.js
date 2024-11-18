class Keys{
    constructor(){
      this.keys=[];
    }
    /**
     * Generates a random key
     * @param {Number} [len=24] Length of the key
     * @returns {String} Access key
     */
    GenerateAccessKey(len=24){
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let id = "";
        for (let i = 0; i < len; i++) 
          id += chars.charAt(Math.floor(Math.random() * chars.length));
        if(!this.keys.includes(id)){
          this.keys.push(id);
          return id;
        }else
          throw new Error('Key already exists');
    };
    /**
     * Check if key exists
     * @param {String} key Validate the existing key
     * @returns {Boolean} TRUE if key exists, else FALSE
     */
    checkKey(key){
      if(this.keys.includes(key)) return true;
      else return false;
    }
    /**
     * Returns the list of keys
     * @param {number} [start=0] Starting point of the key list
     * @param {Number} [end=-1] Ending point of the key list, use _-1_ for all
     * @returns {String[]}
     */
    listKeys(start=0,end=-1){
      return (end==-1 ? this.keys.slice(start) : this.keys.slice(start,end));
    }
    /**
     * Returns the object of the type
     * @param {Array} selection JSON Array
     * @param {String} [type='*'] Data that you want to pull. Use _"," (comma)_ to split selection.
     * @param {mixed} [err=false] Return default value if failed
     * @returns {mixed} Returns the selected target. False if selection has not been found.
     */
    selection(selection,type='*',err=false){
      let select=null;
      if(type==='*')
          return selection;
      else{
          if(type.split(',').length>0){
              type.split(',').forEach(t=>{
                  if((!select&&selection[t])||(select&&select[t])) select = !select ? selection[t] : select[t];
                  else select=err;
              });
          }else{
              if(selection[type]) select = selection[type]; 
              else select = err;
          }
          return select;
      }
  }
}
window.keys = Keys;