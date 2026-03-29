function getAge(dobInput) {
  const dob = new Date(dobInput);
  if (Number.isNaN(dob.getTime())) return null;

  const today = new Date();
  let years = today.getFullYear() - dob.getFullYear();
  const birthdayThisYear = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());

  if (today < birthdayThisYear) years -= 1;
  return years;
}

module.exports = getAge;
