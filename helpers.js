function getUserByEmail (email, database){
  for(let element in database){
    if (database[element].email === email){
      return database[element]
    }
  }
  return false
}
module.exports={getUserByEmail};