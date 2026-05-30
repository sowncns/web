import { MailTD, APIError } from "mailtd";

const client = new MailTD("td_462dd4bcbab3143a6f08d5a3f434adfeca6309a834d47aa0402b2518de64f4cc");

function randomString(length = 6) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }

  return result;
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  try {
    const email = `${randomString()}@sugtbt.com`;

    const account = await client.accounts.create(email, {
      password: "123456",
    });

    console.log("Email đã tạo:", email);
    console.log("Đang chờ mail...");

    let messages = [];

    // Chờ tối đa khoảng 60 giây
    for (let i = 0; i < 30; i++) {
      const res = await client.messages.list(account.id);
      messages = res.messages || [];

      if (messages.length > 0) {
        break;
      }

      console.log("Chưa có mail, đợi 2 giây...");
      await sleep(2000);
    }

    if (messages.length === 0) {
      console.log("Không có email nào trong inbox.");
      return;
    }

    const msg = await client.messages.get(account.id, messages[0].id);

    console.log("Subject:", msg.subject.split(" ")[0]);
  } catch (err) {
    if (err instanceof APIError) {
      console.log("API Error:");
      console.log("Status:", err.status);
      console.log("Code:", err.code);
      console.log("Message:", err.message);
    } else {
      console.log("Lỗi khác:", err);
    }
  }
}

main();

// const client = new MailTD('td_462dd4bcbab3143a6f08d5a3f434adfeca6309a834d47aa0402b2518de64f4cc');