# Profile images

Drop the founder photographs here, named to match `image` in `config/profiles.ts`:

    ahmed.jpg   ->  "/profiles/ahmed.jpg"
    areeb.jpg   ->  "/profiles/areeb.jpg"

Guidance:

- Square images work best. Around 600×600 is plenty; they render at 64–112px.
- `.jpg`, `.png` and `.webp` all work. Update the path in `config/profiles.ts`
  if you change the extension.
- If a file is missing the site does not break: the avatar falls back to the
  person's initials, so you can deploy before the photos are ready.
