import type { Game, CategoryItem } from '@/types/game'

export const categories: CategoryItem[] = [
  { id: 'cat-1', name: 'Fighting', slug: 'Fighting' },
  { id: 'cat-2', name: 'Hack and slash/Beat \'em up', slug: 'Hack and slash/Beat \'em up' },
  { id: 'cat-3', name: 'Indie', slug: 'Indie' },
  { id: 'cat-4', name: 'Music', slug: 'Music' },
  { id: 'cat-5', name: 'Pinball', slug: 'Pinball' },
  { id: 'cat-6', name: 'Platform', slug: 'Platform' },
  { id: 'cat-7', name: 'Point-and-click', slug: 'Point-and-click' },
]

export const games: Game[] = [
  // Fighting games (matching screenshot 5: 6 items)
  {
    id: 'clone-drone',
    name: 'Clone Drone in the Hyperdome',
    price: 1702,
    category: 'Fighting',
    categories: ['Fighting', 'Action', 'Indie'],
    coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2l0q.jpg',
    description: 'Clone Drone in the Hyperdome is a physics-based sword combat game where any part of your body can be sliced off.',
    screenshots: [
      'https://images.igdb.com/igdb/image/upload/t_1080p/sc6gqg.jpg',
      'https://images.igdb.com/igdb/image/upload/t_1080p/sc6gqh.jpg',
      'https://images.igdb.com/igdb/image/upload/t_1080p/sc6gqi.jpg',
      'https://images.igdb.com/igdb/image/upload/t_1080p/sc6gqj.jpg',
    ],
    publisher: 'Doborog Games',
    releaseDate: '2021-07-27',
    stock: 12
  },
  {
    id: 'towerfall-ascension',
    name: 'Towerfall Ascension: Dark World',
    price: 683,
    category: 'Fighting',
    categories: ['Fighting', 'Indie', 'Platform'],
    coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r3q.jpg',
    description: 'TowerFall Ascension is the definitive version of the hit archery combat game.',
    screenshots: [
      'https://images.igdb.com/igdb/image/upload/t_1080p/sc66l2.jpg',
      'https://images.igdb.com/igdb/image/upload/t_1080p/sc7x7t.jpg',
    ],
    publisher: 'Extremely OK Games',
    releaseDate: '2014-03-11',
    stock: 25
  },
  {
    id: 'superfighters-deluxe',
    name: 'Superfighters Deluxe',
    price: 1283,
    category: 'Fighting',
    categories: ['Fighting', 'Action', 'Indie'],
    coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2k3e.jpg',
    description: 'Superfighters Deluxe is a unique action game with a little bit of retro and a whole lot of chaos.',
    screenshots: [
      'https://images.igdb.com/igdb/image/upload/t_1080p/sclh7y.jpg',
    ],
    publisher: 'MythoLogic Interactive',
    releaseDate: '2018-11-30',
    stock: 8
  },
  {
    id: 'fatal-fury',
    name: 'Fatal Fury: City of the Wolves',
    price: 1912,
    category: 'Fighting',
    categories: ['Fighting', 'Arcade'],
    coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7u9q.jpg',
    description: 'SNK beloved Fatal Fury series kicks off with a brand-new entry featuring the revolutionary REV System.',
    screenshots: [
      'https://images.igdb.com/igdb/image/upload/t_1080p/sc7x7t.jpg',
    ],
    publisher: 'SNK',
    releaseDate: '2025-04-24',
    stock: 18
  },
  {
    id: 'mortal-kombat-11',
    name: 'Mortal Kombat 11: Ultimate',
    price: 1289,
    category: 'Fighting',
    categories: ['Fighting', 'Action'],
    coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co21m2.jpg',
    description: 'The definitive MK11 experience. Take control of the protectors of Earthrealm in two critically acclaimed story campaigns.',
    screenshots: [
      'https://images.igdb.com/igdb/image/upload/t_1080p/sc66l2.jpg',
    ],
    publisher: 'Warner Bros. Games',
    releaseDate: '2020-11-17',
    stock: 15
  },
  {
    id: 'battlefield-3',
    name: 'Battlefield 3: Premium Edition',
    price: 1969,
    category: 'Fighting',
    categories: ['Fighting', 'Shooter', 'Action'],
    coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1x4c.jpg',
    description: 'Battlefield 3 leaps ahead of its time with the power of Frostbite 2, the next instalment of DICE cutting-edge game engine.',
    screenshots: [
      'https://images.igdb.com/igdb/image/upload/t_1080p/sc66l2.jpg',
      'https://images.igdb.com/igdb/image/upload/t_1080p/sc7x7t.jpg',
    ],
    publisher: 'Electronic Arts',
    releaseDate: '2011-10-25',
    stock: 20
  },

  // Hack and slash / Beat 'em up (matching screenshot 2: Vampire Survivors: Emergency Meeting)
  {
    id: 'vampire-survivors-emergency-meeting',
    name: 'Vampire Survivors: Emergency Meeting',
    price: 1788,
    category: 'Hack and slash/Beat \'em up',
    categories: ['Hack and slash/Beat \'em up', 'Indie', 'Roguelike'],
    coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7v2e.jpg',
    description: 'The Survivors are desperate to hunt vampires, but are running out of places to look. Only one option remains: bullet hell in space! Gather your trustiest crewmates and prepare to eject thousands of aliens in this Emergency Meeting expansion.',
    screenshots: [
      'https://images.igdb.com/igdb/image/upload/t_1080p/co7v2e.jpg',
      'https://images.igdb.com/igdb/image/upload/t_1080p/sc66l2.jpg',
      'https://images.igdb.com/igdb/image/upload/t_1080p/sc7x7t.jpg',
      'https://images.igdb.com/igdb/image/upload/t_1080p/sclh7y.jpg',
      'https://images.igdb.com/igdb/image/upload/t_1080p/sc6gqg.jpg',
      'https://images.igdb.com/igdb/image/upload/t_1080p/sc6gqh.jpg',
    ],
    publisher: 'poncle',
    releaseDate: '2023-12-18',
    stock: 50
  },
  {
    id: 'elden-ring',
    name: 'Elden Ring',
    price: 1790,
    category: 'Hack and slash/Beat \'em up',
    categories: ['Hack and slash/Beat \'em up', 'RPG', 'Action'],
    coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.jpg',
    description: 'THE NEW FANTASY ACTION RPG. Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring.',
    screenshots: [
      'https://images.igdb.com/igdb/image/upload/t_1080p/sclh7y.jpg',
      'https://images.igdb.com/igdb/image/upload/t_1080p/sc66l2.jpg',
    ],
    publisher: 'Bandai Namco Entertainment',
    releaseDate: '2022-02-25',
    stock: 30
  },

  // Search Results match (matching screenshot 1: "battle" search results: Battlefield 3 & Beast Battle Simulator)
  {
    id: 'beast-battle-simulator',
    name: 'Beast Battle Simulator',
    price: 1373,
    category: 'Indie',
    categories: ['Indie', 'Simulation', 'Action'],
    coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2oau.jpg',
    description: 'Beast Battle Simulator is a physics based battle-simulation sandbox game featuring dinosaurs and beasts armed with lasers and miniguns.',
    screenshots: [
      'https://images.igdb.com/igdb/image/upload/t_1080p/sc7x7t.jpg',
      'https://images.igdb.com/igdb/image/upload/t_1080p/sc66l2.jpg',
    ],
    publisher: 'Dogwood Gaming',
    releaseDate: '2017-08-11',
    stock: 14
  },

  // Pagination / Grid Games (matching screenshot 3)
  {
    id: 'headquarters-wwii',
    name: 'Headquarters World War II',
    price: 1277,
    category: 'Point-and-click',
    categories: ['Point-and-click', 'Strategy'],
    coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co3p2b.jpg',
    description: 'Headquarters: World War II is a fast paced turn-based strategy game where battlefield tactics are as important as army management.',
    screenshots: [
      'https://images.igdb.com/igdb/image/upload/t_1080p/sc66l2.jpg',
    ],
    publisher: 'Slitherine Software',
    releaseDate: '2024-04-11',
    stock: 10
  },
  {
    id: 'fivem',
    name: 'FiveM',
    price: 837,
    category: 'Indie',
    categories: ['Indie', 'Multiplayer'],
    coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co41mu.jpg',
    description: 'FiveM is a multiplayer modification framework for GTA V, allowing you to play on customized dedicated servers.',
    screenshots: [
      'https://images.igdb.com/igdb/image/upload/t_1080p/sc7x7t.jpg',
    ],
    publisher: 'Cfx.re',
    releaseDate: '2015-05-01',
    stock: 99
  },
  {
    id: 'tropico-4',
    name: 'Tropico 4: Modern Times',
    price: 243,
    category: 'Point-and-click',
    categories: ['Point-and-click', 'Simulation', 'Strategy'],
    coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co26vi.jpg',
    description: 'The times are changing and the island nation of Tropico is evolving. The Internet, a new world order, and modern technologies come into play.',
    screenshots: [
      'https://images.igdb.com/igdb/image/upload/t_1080p/sclh7y.jpg',
    ],
    publisher: 'Kalypso Media',
    releaseDate: '2012-03-27',
    stock: 40
  },

  // Other categories for dropdown and pagination
  {
    id: '1',
    name: 'Among Us',
    price: 99,
    category: 'Indie',
    categories: ['Indie', 'Party'],
    coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.jpg',
    description: 'An online and local party game of teamwork and betrayal for 4-15 players... in space!',
    screenshots: [
      'https://images.igdb.com/igdb/image/upload/t_1080p/sc66l2.jpg',
    ],
    publisher: 'Innersloth',
    releaseDate: '2018-11-16',
    stock: 100
  },
  {
    id: '2',
    name: 'Planet Zoo: Aquatic Pack',
    price: 350,
    category: 'Indie',
    categories: ['Indie', 'Simulation'],
    coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2oau.jpg',
    description: 'Expand your zoo into a marine wonderland with Planet Zoo Aquatic Pack!',
    screenshots: [
      'https://images.igdb.com/igdb/image/upload/t_1080p/sc7x7t.jpg',
    ],
    publisher: 'Frontier Developments',
    releaseDate: '2020-12-08',
    stock: 35
  },
  {
    id: '3',
    name: 'Blake: The Visual Novel',
    price: 189,
    category: 'Point-and-click',
    categories: ['Point-and-click', 'Indie'],
    coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co3p2b.jpg',
    description: 'A psychological thriller visual novel following Blake through mystery and moral decisions.',
    screenshots: [
      'https://images.igdb.com/igdb/image/upload/t_1080p/sclh7y.jpg',
    ],
    publisher: 'Oriplay',
    releaseDate: '2021-08-31',
    stock: 15
  },
  {
    id: '4',
    name: 'Motor City Online',
    price: 450,
    category: 'Platform',
    categories: ['Platform', 'Racing'],
    coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1x4c.jpg',
    description: 'Classic muscle car racing and modification MMO from EA.',
    screenshots: [
      'https://images.igdb.com/igdb/image/upload/t_1080p/sc66l2.jpg',
    ],
    publisher: 'EA',
    releaseDate: '2001-10-30',
    stock: 5
  },
  {
    id: '5',
    name: 'Bubsy in: Claws Encounters of the Furred Kind',
    price: 150,
    category: 'Platform',
    categories: ['Platform', 'Retro'],
    coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co26vi.jpg',
    description: 'A classic 16-bit platformer starring the wisecracking bobcat Bubsy.',
    screenshots: [
      'https://images.igdb.com/igdb/image/upload/t_1080p/sc7x7t.jpg',
    ],
    publisher: 'Accolade',
    releaseDate: '1993-05-01',
    stock: 22
  },
  {
    id: '6',
    name: 'Cyberpunk 2077',
    price: 1399,
    category: 'Music',
    categories: ['Music', 'RPG', 'Action'],
    coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co41mu.jpg',
    description: 'An open-world, action-adventure RPG set in the dark future of Night City.',
    screenshots: [
      'https://images.igdb.com/igdb/image/upload/t_1080p/sclh7y.jpg',
    ],
    publisher: 'CD PROJEKT RED',
    releaseDate: '2020-12-10',
    stock: 60
  },
  {
    id: '8',
    name: 'Hollow Knight',
    price: 315,
    category: 'Platform',
    categories: ['Platform', 'Indie', 'Metroidvania'],
    coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1rgi.jpg',
    description: 'Forge your own path in Hollow Knight! An epic action adventure through a vast ruined kingdom of insects and heroes.',
    screenshots: [
      'https://images.igdb.com/igdb/image/upload/t_1080p/sc66l2.jpg',
    ],
    publisher: 'Team Cherry',
    releaseDate: '2017-02-24',
    stock: 75
  },
  {
    id: 'pinball-fx3',
    name: 'Pinball FX3: Williams Pinball',
    price: 499,
    category: 'Pinball',
    categories: ['Pinball', 'Arcade'],
    coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2oau.jpg',
    description: 'Pinball FX3 is the biggest, most community focused pinball game ever created.',
    screenshots: [
      'https://images.igdb.com/igdb/image/upload/t_1080p/sc7x7t.jpg',
    ],
    publisher: 'Zen Studios',
    releaseDate: '2017-09-26',
    stock: 45
  },
  {
    id: 'demon-tilt',
    name: 'DEMON TILT: Occult Pinball Action',
    price: 369,
    category: 'Pinball',
    categories: ['Pinball', 'Action'],
    coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1x4c.jpg',
    description: 'Turbo-Charged Pinball is back! Updated with bigger sprites, more baddies, more secrets and of course more bullets!',
    screenshots: [
      'https://images.igdb.com/igdb/image/upload/t_1080p/sclh7y.jpg',
    ],
    publisher: 'FLARB LLC',
    releaseDate: '2019-12-13',
    stock: 30
  },
  {
    id: 'beat-saber',
    name: 'Beat Saber',
    price: 799,
    category: 'Music',
    categories: ['Music', 'VR'],
    coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2l0q.jpg',
    description: 'Beat Saber is a VR rhythm game where you slash the beats of adrenaline-pumping music as they fly towards you.',
    screenshots: [
      'https://images.igdb.com/igdb/image/upload/t_1080p/sc66l2.jpg',
    ],
    publisher: 'Beat Games',
    releaseDate: '2019-05-21',
    stock: 40
  },
  {
    id: 'rhythm-doctor',
    name: 'Rhythm Doctor',
    price: 319,
    category: 'Music',
    categories: ['Music', 'Indie'],
    coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co3p2b.jpg',
    description: 'Heal patients with your rhythm! Rhythm Doctor is a rhythm game where you heal patients by defibrillating on downbeats.',
    screenshots: [
      'https://images.igdb.com/igdb/image/upload/t_1080p/sc7x7t.jpg',
    ],
    publisher: '7th Beat Games',
    releaseDate: '2021-02-26',
    stock: 25
  },
  {
    id: 'celeste',
    name: 'Celeste',
    price: 369,
    category: 'Platform',
    categories: ['Platform', 'Indie'],
    coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r3q.jpg',
    description: 'Help Madeline survive her inner demons on her journey to the top of Celeste Mountain.',
    screenshots: [
      'https://images.igdb.com/igdb/image/upload/t_1080p/sclh7y.jpg',
    ],
    publisher: 'Maddy Makes Games',
    releaseDate: '2018-01-25',
    stock: 50
  },
  {
    id: 'dead-cells',
    name: 'Dead Cells',
    price: 499,
    category: 'Hack and slash/Beat \'em up',
    categories: ['Hack and slash/Beat \'em up', 'Roguelike', 'Platform'],
    coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co21m2.jpg',
    description: 'Dead Cells is a rogue-lite, metroidvania inspired, action-platformer.',
    screenshots: [
      'https://images.igdb.com/igdb/image/upload/t_1080p/sc66l2.jpg',
    ],
    publisher: 'Motion Twin',
    releaseDate: '2018-08-07',
    stock: 35
  },
  {
    id: 'hades',
    name: 'Hades',
    price: 529,
    category: 'Hack and slash/Beat \'em up',
    categories: ['Hack and slash/Beat \'em up', 'Action'],
    coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1rgi.jpg',
    description: 'Defy the god of the dead as you hack and slash out of the Underworld in this rogue-like dungeon crawler.',
    screenshots: [
      'https://images.igdb.com/igdb/image/upload/t_1080p/sc7x7t.jpg',
    ],
    publisher: 'Supergiant Games',
    releaseDate: '2020-09-17',
    stock: 45
  },
  {
    id: 'monkey-island',
    name: 'Return to Monkey Island',
    price: 469,
    category: 'Point-and-click',
    categories: ['Point-and-click', 'Adventure'],
    coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.jpg',
    description: 'Return to Monkey Island is an unexpected, thrilling return of series creator Ron Gilbert that continues the story of the legendary adventure games.',
    screenshots: [
      'https://images.igdb.com/igdb/image/upload/t_1080p/sclh7y.jpg',
    ],
    publisher: 'Devolver Digital',
    releaseDate: '2022-09-19',
    stock: 20
  },
  {
    id: 'machinarium',
    name: 'Machinarium',
    price: 249,
    category: 'Point-and-click',
    categories: ['Point-and-click', 'Puzzle'],
    coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2oau.jpg',
    description: 'Machinarium is the award-winning adventure game developed by the makers of Samorost and Botanicula.',
    screenshots: [
      'https://images.igdb.com/igdb/image/upload/t_1080p/sc66l2.jpg',
    ],
    publisher: 'Amanita Design',
    releaseDate: '2009-10-16',
    stock: 30
  },
  {
    id: 'guilty-gear-strive',
    name: 'Guilty Gear -Strive-',
    price: 1399,
    category: 'Fighting',
    categories: ['Fighting', 'Action'],
    coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7u9q.jpg',
    description: 'Discover the Smell of the Game with Guilty Gear -Strive-! Immerse yourself into new gameplay mechanics designed to be simple and welcoming.',
    screenshots: [
      'https://images.igdb.com/igdb/image/upload/t_1080p/sc66l2.jpg',
    ],
    publisher: 'Arc System Works',
    releaseDate: '2021-06-11',
    stock: 28
  },
  {
    id: 'street-fighter-6',
    name: 'Street Fighter 6',
    price: 1899,
    category: 'Fighting',
    categories: ['Fighting', 'Action'],
    coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2k3e.jpg',
    description: 'Here comes Capcom newest challenger! Street Fighter 6 spans across three distinct game modes: World Tour, Fighting Ground and Battle Hub.',
    screenshots: [
      'https://images.igdb.com/igdb/image/upload/t_1080p/sc7x7t.jpg',
    ],
    publisher: 'Capcom',
    releaseDate: '2023-06-02',
    stock: 32
  }
]

export function getAllCategories(): CategoryItem[] {
  return categories
}

export function getAllGames(): Game[] {
  return games
}

export function getGameById(id: string): Game | undefined {
  return games.find((g) => g.id === id)
}

export function getGamesByCategory(categoryName: string): Game[] {
  const normalized = categoryName.trim().toLowerCase()
  return games.filter((g) => {
    if (g.category.toLowerCase() === normalized) return true
    if (g.categories?.some((c) => c.toLowerCase() === normalized)) return true
    return false
  })
}

export function searchGames(query: string): Game[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return []
  return games.filter((g) => {
    return (
      g.name.toLowerCase().includes(normalized) ||
      g.category.toLowerCase().includes(normalized)
    )
  })
}
