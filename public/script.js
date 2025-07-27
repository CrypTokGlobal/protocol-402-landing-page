document.getElementById("whitepaperForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = this.name.value.trim();
  const email = this.email.value.trim();
  const timestamp = new Date().toISOString();

  const submission = { name, email, timestamp };

  try {
    const res = await fetch("/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submission),
    });

    if (res.ok) {
      alert("✅ Thank you! Your download will begin shortly.");
      window.location.href = "https://sceta.io/wp-content/uploads/2025/06/V.07.01.Protocol-402-South-Carolinas-Path-to-Monetized-Public-Infrastructure-Innovation.Final_.pdf";
    } else {
      alert("Something went wrong. Please try again.");
    }
  } catch (err) {
    console.error(err);
    alert("There was an error submitting the form.");
  }
});