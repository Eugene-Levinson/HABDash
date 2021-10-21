module.exports.verify_raw_data = function (telem) {
    //check if null or undefined
    if (telem == undefined || telem == null || telem == ""){
        throw new Error("TelemIsUndefined")
    }
}
