import a1 from '../assets/avatars/avatar-1-grandma-traditional.jpg'
import a2 from '../assets/avatars/avatar-2-grandpa-shirt.jpg'
import a3 from '../assets/avatars/avatar-3-grandma-floral.jpg'
import a4 from '../assets/avatars/avatar-4-grandpa-polo.jpg'
import a5 from '../assets/avatars/avatar-5-grandma-bun.jpg'
import a6 from '../assets/avatars/avatar-6-grandpa-tang.jpg'

export const AVATARS = [
  { id: 0, src: a1, label: '阿嬤（傳統）' },
  { id: 1, src: a2, label: '阿公（襯衫）' },
  { id: 2, src: a3, label: '阿嬤（花衣）' },
  { id: 3, src: a4, label: '阿公（Polo）' },
  { id: 4, src: a5, label: '阿嬤（銀髻）' },
  { id: 5, src: a6, label: '阿公（唐裝）' },
]

export const getAvatarSrc = (index) =>
  index != null && AVATARS[index] ? AVATARS[index].src : null
