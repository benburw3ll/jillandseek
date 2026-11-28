import { Age, PhotoRead, Sex, Size } from '@jillandseek/core'
import { z } from 'zod'
import type { AiFeature } from './client.ts'

// The one AI job (ADR-0007 point 1): reading the missing dog's photo into the form's traits.
// The instruction is fixed text. Nothing about the dog, the owner or the search is added to it,
// and a read never says whether any listing is the dog.

const INSTRUCTION = `This is a photo of a pet dog. Describe only what the dog in it looks like, to fill in a form.

Report only what the photo shows clearly. When you can't tell, say so: use "unknown", an empty list or null. A wrong guess is worse than "unknown".

- dog_visible: false if no dog can be made out. Then leave every other field unknown or empty.
- breeds: up to three breed words as an owner would say them, most likely first, such as "labrador retriever" or "shepherd mix". Use an empty list when the look doesn't point to a breed.
- colors: the coat's main colours in plain words, most of the coat first, such as "black", "tan" or "white". At most four.
- size: "small", "medium" or "large" for an adult dog of this build, or "unknown" when nothing in the photo shows the scale.
- sex: "male" or "female" only when the photo plainly shows it. Otherwise "unknown".
- age: "puppy", "young", "adult" or "senior" when the face and body make it plain. Otherwise "unknown".
- marks: one short sentence on marks that would tell this dog from others like it, such as a white chest patch, one blue eye, a docked tail or a collar's colour. null when there are none to see.

Describe the dog only. Don't describe people, places, text or anything else in the photo.`

/** The answer asked of the model. Lengths and counts are checked here, after it answers. */
const Answer = z.object({
  dog_visible: z.boolean(),
  breeds: z.array(z.string()),
  colors: z.array(z.string()),
  size: Size,
  sex: Sex,
  age: Age,
  marks: z.string().nullable(),
})

const words = (list: string[], most: number) =>
  [
    ...new Set(list.map((w) => w.trim().toLowerCase().replace(/\s+/g, ' ')).filter((w) => w !== '' && w.length <= 60)),
  ].slice(0, most)

export const photoTraits: AiFeature<z.infer<typeof Answer>> = {
  name: 'photo-traits',
  instruction: INSTRUCTION,
  schema: Answer,
  maxTokens: 4096,
}

/** The model's answer as the form's traits. With no dog in the photo, nothing is filled. */
export function photoReadOf(a: z.infer<typeof Answer>): PhotoRead {
  if (!a.dog_visible) {
    return PhotoRead.parse({ dogVisible: false, traits: {}, marks: null })
  }
  const marks = a.marks?.trim().replace(/\s+/g, ' ').slice(0, 300) ?? ''
  return PhotoRead.parse({
    dogVisible: true,
    traits: { breeds: words(a.breeds, 3), colors: words(a.colors, 4), size: a.size, sex: a.sex, age: a.age },
    marks: marks === '' ? null : marks,
  })
}
