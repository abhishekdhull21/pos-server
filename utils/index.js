module.exports.parseFullName = (fullName = "") => {
  let first_name = "";
  let middle_name = "";
  let last_name = "";

  if (fullName && typeof fullName === "string") {
    fullName = fullName.replace(/\s+/g, " ").trim(); // normalize spaces
    const nameArray = fullName.split(" ");

    first_name = nameArray[0];

    if (nameArray.length > 2) {
      middle_name = nameArray.slice(1, -1).join(" ");
    }

    if (nameArray.length > 1) {
      last_name = nameArray[nameArray.length - 1];
    }
  }

  return { first_name, middle_name, last_name };
}

// mysql -h pos-test-db.c1oqkmoes089.ap-south-1.rds.amazonaws.com -u pos_user_admin -p XHisartest123
