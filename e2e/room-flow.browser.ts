import { expect, test } from "@playwright/test"

test("launches, joins by invite, syncs chat, and closes a room", async ({
  page: host,
  browser,
  baseURL,
}) => {
  const guest = await browser.newPage({ baseURL })
  const suffix = Date.now().toString(36)
  try {
    await host.goto("/lobby")
    await host
      .getByRole("button", { name: "Launch space", exact: true })
      .click()
    await host.getByLabel("Room name").fill(`smoke-${suffix}`)
    await host.locator("#create-user-name").fill(`Host ${suffix}`)
    const created = host.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        new URL(response.url()).pathname === "/api/livekit/rooms"
    )
    await host.getByRole("button", { name: "Go live", exact: true }).click()
    const createdResponse = await created
    expect(createdResponse.ok()).toBe(true)
    const { roomName } = (await createdResponse.json()).data

    await expect(host.getByLabel("Connection status: Connected")).toBeVisible()
    const message = "Smoke test chat history"
    await host.getByPlaceholder("Type a message...").fill(message)
    await host.getByPlaceholder("Type a message...").press("Enter")
    await expect(
      host.getByText(message, { exact: true }).filter({ visible: true }).first()
    ).toBeVisible()

    await guest.goto(`/space/${roomName}`)
    await guest.locator("#join-user-name").fill(`Guest ${suffix}`)
    await guest.getByRole("button", { name: "Join space", exact: true }).click()
    await expect(guest.getByLabel("Connection status: Connected")).toBeVisible()
    await expect(
      guest
        .getByText(message, { exact: true })
        .filter({ visible: true })
        .first()
    ).toBeVisible()

    await host.getByRole("button", { name: "End Space", exact: true }).click()
    await host
      .getByRole("button", { name: "End for everyone", exact: true })
      .click()
    await expect
      .poll(async () => {
        const response = await guest.request.get(
          `/api/livekit/rooms?space=${encodeURIComponent(roomName)}`
        )
        return (await response.json()).ended
      })
      .toBe(true)
    await guest.goto(`/space/${roomName}`)
    await expect(
      guest.getByRole("heading", { name: "This space has ended" })
    ).toBeVisible()
  } finally {
    await guest.close()
  }
})
