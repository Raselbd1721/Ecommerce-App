

const CloudId=async(val)=>{
try{
  const sparate=val.split("/")
  const last=sparate[sparate.length-1]
  const dot=last.split(".")
  const final=dot[0]
  return final
}catch(error){
  throw error
}
}
module.exports=CloudId