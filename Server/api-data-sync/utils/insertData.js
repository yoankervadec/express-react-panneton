//
//

export const insertData = async (connection, query, data) => {
  try {
    await connection.execute(query, data);
  } catch (error) {
    console.error(`Error inserting data: ${error}`);
  }
};
