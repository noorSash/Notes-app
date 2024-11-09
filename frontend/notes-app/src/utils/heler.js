export const validateEmail =(email)=>{
    const regex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);

};

export const getInitials =(name) =>{

    if(!name) return"";
    const words=name.split("");
    let Initials="";

    for(let i=0; i<Math.min(words.length,2);i++){
        Initials+=words[i][0];

    }
    return Initials.toUpperCase();
    

}