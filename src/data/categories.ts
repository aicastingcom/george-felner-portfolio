export type DeviceKind = 'cinema' | 'phone' | 'tv' | 'macbook' | 'ipad' | 'monitor'

export type ToolKind = 'arri' | 'laptop' | 'red' | 'dslr' | 'dslrPlain' | 'ipad' | 'drone' | 'phone'

export type VideoOrientation = 'portrait' | 'landscape'

export type CategoryVideo = {
  src: string
  label: string
  /** Override auto-detect when file metadata doesn’t match intended framing */
  orientation?: VideoOrientation
}

export type Category = {
  id: string
  title: string
  tagline: string
  tool: ToolKind
  device: DeviceKind
  /** After rotate: figure on left or right */
  profileSide: 'left' | 'right'
  videos: CategoryVideo[]
}

const v = (path: string) => encodeURI(path)

export const categories: Category[] = [
  {
    id: 'cinema',
    title: 'Cinema',
    tagline: 'Narrative · Emotion · Light',
    tool: 'arri',
    device: 'cinema',
    profileSide: 'right',
    videos: [{ src: v('/videos/cinema/FICTION.mp4'), label: 'Fiction Showreel' }],
  },
  {
    id: 'ai',
    title: 'AI Filmmaking',
    tagline: 'Vision · Intelligence · Cinema',
    tool: 'laptop',
    device: 'phone',
    profileSide: 'left',
    videos: [
      { src: v('/videos/ai/Foxelli Edit.mp4'), label: 'Foxelli' },
      { src: v('/videos/ai/Wireless GameStation Video1.mp4'), label: 'Wireless GameStation' },
      { src: v('/videos/ai/Suspenders FINAL V2 Upscaled.mp4'), label: 'Suspenders' },
      { src: v('/videos/ai/Bored v3.mp4'), label: 'Bored' },
      { src: v('/videos/ai/Chevron X2 - V4.mp4'), label: 'Chevron' },
      { src: v('/videos/ai/Human Powered V3.mp4'), label: 'Human Powered' },
    ],
  },
  {
    id: 'advertising',
    title: 'Advertising',
    tagline: 'Crafted for brands that move',
    tool: 'red',
    device: 'tv',
    profileSide: 'right',
    // Every file from Television/
    videos: [
      { src: v('/videos/advertising/ADVERTISING Showreel.mp4'), label: 'Advertising Showreel' },
      { src: v('/videos/advertising/Nestle - George Felner.mp4'), label: 'Nestlé' },
      { src: v('/videos/advertising/Newt in Somerset - Cider.mp4'), label: 'Newt Cider' },
      { src: v('/videos/advertising/Straton Watch.mp4'), label: 'Straton Watch' },
      { src: v('/videos/advertising/Toyota - george Felner.mp4'), label: 'Toyota' },
      { src: v('/videos/advertising/Winxo Petrol.mp4'), label: 'Winxo' },
    ],
  },
  {
    id: 'corporate',
    title: 'Corporate',
    tagline: 'Clarity · Craft · Purpose',
    tool: 'dslr',
    device: 'macbook',
    profileSide: 'left',
    videos: [
      { src: v('/videos/corporate/Corporate Showreel.mp4'), label: 'Corporate Showreel' },
      { src: v('/videos/corporate/Barclays.mp4'), label: 'Barclays' },
      { src: v('/videos/corporate/JLL.mp4'), label: 'JLL' },
      { src: v('/videos/corporate/Harrods - Ultherapy.mp4'), label: 'Harrods' },
      { src: v('/videos/corporate/Wycliffe College.mp4'), label: 'Wycliffe College' },
      { src: v('/videos/corporate/Camelot CareHome.mp4'), label: 'Camelot' },
      { src: v('/videos/corporate/TSK highlights v2 0.mp4'), label: 'TSK' },
      { src: v('/videos/corporate/Aspect - Drain Repair.mp4'), label: 'Aspect' },
      { src: v('/videos/corporate-extra/Wimbledon V5.mp4'), label: 'Wimbledon' },
    ],
  },
  {
    id: 'animation',
    title: 'Animation',
    tagline: 'Frame by frame',
    tool: 'ipad',
    device: 'ipad',
    profileSide: 'right',
    videos: [
      { src: v('/videos/social/Animation/AAAD - animation.mp4'), label: 'AAAD Animation', orientation: 'portrait' },
      { src: v('/videos/corporate/Skittles - Animation.mp4'), label: 'Skittles', orientation: 'portrait' },
      { src: v('/videos/webseries/Money Talks Showreel.mp4'), label: 'Money Talks Showreel', orientation: 'landscape' },
      { src: v('/videos/webseries/Money Talks 01.mp4'), label: 'Money Talks 01', orientation: 'landscape' },
      {
        src: v('/videos/webseries/Money Talks - The Crypto Mountain.mp4'),
        label: 'Crypto Mountain',
        orientation: 'landscape',
      },
    ],
  },
  {
    id: 'drone',
    title: 'Drone videos',
    tagline: 'Above the frame',
    tool: 'drone',
    device: 'monitor',
    profileSide: 'left',
    videos: [
      { src: v('/videos/corporate/Drone Reel - George Felner.mp4'), label: 'Drone Reel' },
    ],
  },
  {
    id: 'social',
    title: 'Social Media',
    tagline: 'Stories that travel',
    tool: 'phone',
    device: 'phone',
    profileSide: 'right',
    videos: [
      { src: v('/videos/social/15 - Google Activation v2.mp4'), label: 'Google Activation' },
      { src: v('/videos/social/Newt in Somerset - Pasta.mp4'), label: 'Pasta' },
      { src: v('/videos/social/Spitalfields SubMaster.mp4'), label: 'Spitalfields' },
      { src: v('/videos/social/Newt in Somerset - Buffalos.mp4'), label: 'Buffalos' },
      { src: v('/videos/social/Tree Surprise 60 seconds (2).mp4'), label: 'Tree Surprise' },
      { src: v('/videos/social/Newt in Somerset - Strawberries.mp4'), label: 'Strawberries' },
      { src: v('/videos/social/AAAAB- Mix.mp4'), label: 'AAAAB Mix' },
      { src: v('/videos/social/Repair Insurance.mp4'), label: 'Repair Insurance' },
      { src: v('/videos/social/Fast Repair 1.mp4'), label: 'Fast Repair 1' },
      { src: v('/videos/social/Fast Repair 2.mp4'), label: 'Fast Repair 2' },
      { src: v('/videos/social/Aspect - Drain unBlock.mp4'), label: 'Drain Unblock' },
      { src: v('/videos/social/Aspect - Pipe Repair.mp4'), label: 'Pipe Repair' },
      { src: v('/videos/social/Newt in Somerset - Ice Cream.mp4'), label: 'Ice Cream' },
    ],
  },
  {
    id: 'webseries',
    title: 'Webseries',
    tagline: 'Episodes · Characters · Worlds',
    tool: 'dslrPlain',
    device: 'monitor',
    profileSide: 'left',
    videos: [
      {
        src: v('/videos/webseries/Webseries Sessions S02E04 Back to the forgotten.mp4'),
        label: 'Webseries Sessions',
      },
      { src: v('/videos/webseries/Apps & Downs - Intro.mp4'), label: 'Apps & Downs' },
      { src: v('/videos/webseries/Chatter Heads - Meghan read to Archie.mp4'), label: 'Chatter Heads' },
    ],
  },
]

export const aboutCopy = [
  'I’m George Felner, a British Franco-Portuguese filmmaker, Art Director and visual storyteller with nearly four decades of experience across film, advertising, animation, comedy, photography, motion graphics and AI video.',
  'My work has won 12 international awards, and my recent AI films have been selected at multiple festivals, including the Cannes AI Film Festival. I’ve created content for brands including Barclays, Toyota, Lexus, JLL, Dyson, Sagres and Vodafone, bringing a hands-on mix of directing, filming, editing, drone operation, storytelling, humour, design and emerging AI workflows.',
  'Whether creating a cinematic brand film, short-form social piece, comedy sketch or AI-driven concept, my focus is always the same: original ideas, strong emotional hooks, and images people remember.',
]
