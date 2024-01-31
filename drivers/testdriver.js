exports.test = function(request,reponse){
    return reponse.status(200).json(
        {
            estado:"bien",
            haciendo:"test"
            
        }
    )
}