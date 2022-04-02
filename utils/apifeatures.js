class Apifeatures {
    constructor(query,queryStr){
        this.query=query;
        this.queryStr=queryStr;
    }
    search(){
        const keyword=this.queryStr.keyword?{
            name:{
                $regex:this.queryStr.keyword,
                $options:"i",
            }
        }:{};
        this.query=this.query.find({...keyword});
        return this;
    };
    filter(){
        let querycopy={...this.queryStr};
        const removefields=["keyword","page","limit"];
        removefields.forEach(key=>delete querycopy[key]);
        querycopy=JSON.stringify(querycopy);
        querycopy=querycopy.replace(/\b(gt|gte|lt|lte)\b/g,key=>`$${key}`);
        querycopy=JSON.parse(querycopy);
        this.query=this.query.find(querycopy);
        return this;
    };
    pagination(resultperpage){
        const curpage=this.queryStr.page;
        const skip=resultperpage*(curpage-1);
        this.query=this.query.limit(resultperpage).skip(skip);
        return this;
    }
}

module.exports=Apifeatures;