// ============================================
// AllAboutbooks V2 - Seed 50 books
// Run: node seed-books.mjs
// ============================================

import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  'https://cncabgzbyegfvbvazbgs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuY2FiZ3pieWVnZnZidmF6YmdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDk5MDcsImV4cCI6MjA4MTEyNTkwN30.FFeLZcWHIVp_bscVINfjM75xwkJj-HH3rTJ3KZ2UH94'
);

// Helper: fetch verified cover from Google books API
async function getCover(isbn, title) {
  try {
    // Try ISBN first
    if (isbn) {
      const r = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
      const d = await r.json();
      const c = d.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
      if (c) return c.replace('http://', 'https://').replace('&edge=curl', '').replace('zoom=5', 'zoom=1');
    }
    // Fallback: title search
    const r2 = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(title)}&maxResults=1`);
    const d2 = await r2.json();
    const c2 = d2.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
    if (c2) return c2.replace('http://', 'https://').replace('&edge=curl', '').replace('zoom=5', 'zoom=1');
  } catch {}
  return null;
}

// Helper: get or create author
async function getOrCreateAuthor(name, nationality = '', bio = '') {
  const { data: existing } = await sb.from('authors').select('id').ilike('name', name).single();
  if (existing) return existing.id;

   const { data: created, error } = await sb.from('authors').insert({
    name,
    nationality,
    bio: bio || `Author of acclaimed books`,
    image_url: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name) + '&size=200&background=random',
  }).select('id').single();

  if (error) { console.error('Author error:', error.message); return null; }
  return created.id;
}

// ============================================
// BOOK DATA - 50 curated books
// ============================================
const books = [
  // --- INDIAN ENGLISH ---
  { title: 'The God of Small Things', author: 'Arundhati Roy', isbn: '9780679457312', year: 1997, pages: 321, lang: 'english', genre: ['Fiction', 'Classic'], trending: true, nationality: 'Indian', desc: 'A story of fraternal twins whose childhood in Kerala is shattered by a forbidden love affair.' },
  { title: '2 States', author: 'Chetan Bhagat', isbn: '9788129115300', year: 2009, pages: 280, lang: 'english', genre: ['Fiction', 'Romance'], trending: true, nationality: 'Indian', desc: 'A humorous tale of a Punjabi boy and Tamil girl navigating cultural differences in their families.' },
  { title: 'The White Tiger', author: 'Aravind Adiga', isbn: '9781416562603', year: 2008, pages: 304, lang: 'english', genre: ['Fiction', 'Thriller'], trending: false, nationality: 'Indian', desc: 'A darkly comic novel about a rickshaw driver who rises from servant to entrepreneur in modern India.' },
  { title: 'The Immortals of Meluha', author: 'Amish Tripathi', isbn: '9789380658742', year: 2010, pages: 400, lang: 'english', genre: ['Fiction', 'Fantasy'], trending: true, nationality: 'Indian', desc: 'A reimagining of Lord Shiva as a Tibetan tribal chief who arrives in Meluha during a crisis.' },
  { title: 'Half Girlfriend', author: 'Chetan Bhagat', isbn: '9788129135728', year: 2014, pages: 280, lang: 'english', genre: ['Fiction', 'Romance'], trending: false, nationality: 'Indian', desc: 'A Bihari boy in love with a sophisticated Delhi girl, set between rural India and New York.' },
  { title: 'A Suitable Boy', author: 'Vikram Seth', isbn: '9780060786526', year: 1993, pages: 1349, lang: 'english', genre: ['Fiction', 'Classic'], trending: false, nationality: 'Indian', desc: 'An epic story of four families in post-independence India, centered on a mother\'s quest for a suitable husband for her daughter.' },
  { title: 'The Discovery of India', author: 'Jawaharlal Nehru', isbn: '9780143031031', year: 1946, pages: 595, lang: 'english', genre: ['History', 'Non-Fiction'], trending: false, nationality: 'Indian', desc: 'Written during imprisonment, Nehru traces India\'s history from ancient civilization to the modern independence movement.' },
  { title: 'Train to Pakistan', author: 'Khushwant Singh', isbn: '9780802130334', year: 1956, pages: 181, lang: 'english', genre: ['Fiction', 'History'], trending: false, nationality: 'Indian', desc: 'Set during the 1947 Partition, this novel depicts how communal violence tears apart a peaceful border village.' },
  { title: 'The Palace of Illusions', author: 'Chitra Banerjee Divakaruni', isbn: '9781400096206', year: 2008, pages: 384, lang: 'english', genre: ['Fiction', 'Fantasy'], trending: false, nationality: 'Indian', desc: 'The Mahabharata retold from the viewpoint of Draupadi, the feisty heroine born from fire.' },
  { title: 'A Thousand Splendid Suns', author: 'Khaled Hosseini', isbn: '9781594489501', year: 2007, pages: 372, lang: 'english', genre: ['Fiction', 'Classic'], trending: true, nationality: 'Afghan-American', desc: 'Two women born a generation apart find strength in each other against the backdrop of war-torn Afghanistan.' },

  // --- HINDI ---
  { title: 'Godan', author: 'Munshi Premchand', isbn: '9788126700530', year: 1936, pages: 312, lang: 'hindi', genre: ['Fiction', 'Hindi Literature'], trending: true, nationality: 'Indian', desc: 'Premchand\'s masterpiece about a poor farmer\'s dream to own a cow, exposing rural India\'s social injustices.' },
  { title: 'Raag Darbari', author: 'Shrilal Shukla', isbn: '9788126700547', year: 1968, pages: 352, lang: 'hindi', genre: ['Fiction', 'Hindi Literature'], trending: false, nationality: 'Indian', desc: 'A satirical novel portraying rural Indian politics and the corruption of power in a small village.' },
  { title: 'Madhushala', author: 'Harivansh Rai Bachchan', isbn: '9789350641125', year: 1935, pages: 128, lang: 'hindi', genre: ['Poetry', 'Hindi Literature'], trending: true, nationality: 'Indian', desc: 'A timeless collection of poems using the metaphor of a tavern to explore life, love, and mortality.' },
  { title: 'Nirmala', author: 'Munshi Premchand', isbn: '9788126700523', year: 1928, pages: 200, lang: 'hindi', genre: ['Fiction', 'Hindi Literature'], trending: false, nationality: 'Indian', desc: 'The tragic story of a young woman married to an older widower, exploring dowry and patriarchal oppression.' },
  { title: 'Kamayani', author: 'Jaishankar Prasad', isbn: '9789350641149', year: 1936, pages: 168, lang: 'hindi', genre: ['Poetry', 'Hindi Literature', 'Philosophy'], trending: false, nationality: 'Indian', desc: 'An epic Hindi poem reimagining the story of Manu and the flood, exploring human emotions and consciousness.' },
  { title: 'Chitralekha', author: 'Bhagwati Charan Verma', isbn: '9788126700554', year: 1934, pages: 176, lang: 'hindi', genre: ['Fiction', 'Hindi Literature', 'Philosophy'], trending: false, nationality: 'Indian', desc: 'A philosophical novel questioning the nature of sin and virtue through a courtesan\'s story in ancient India.' },
  { title: 'Rashmirathi', author: 'Ramdhari Singh Dinkar', isbn: '9789350641156', year: 1952, pages: 144, lang: 'hindi', genre: ['Poetry', 'Hindi Literature'], trending: false, nationality: 'Indian', desc: 'An epic poem about Karna from the Mahabharata, celebrating his valor, generosity, and tragic fate.' },

  // --- INTERNATIONAL BESTSELLERS ---
  { title: 'Atomic Habits', author: 'James Clear', isbn: '9780735211292', year: 2018, pages: 320, lang: 'english', genre: ['Self-Help', 'Non-Fiction'], trending: true, nationality: 'American', desc: 'A practical guide to building good habits and breaking bad ones through tiny changes that compound.' },
  { title: 'Sapiens', author: 'Yuval Noah Harari', isbn: '9780062316097', year: 2014, pages: 443, lang: 'english', genre: ['Non-Fiction', 'History'], trending: true, nationality: 'Israeli', desc: 'A sweeping history of humankind from the Stone Age to the Silicon Age.' },
  { title: 'The Psychology of Money', author: 'Morgan Housel', isbn: '9780857197689', year: 2020, pages: 256, lang: 'english', genre: ['Non-Fiction', 'Business'], trending: true, nationality: 'American', desc: 'Timeless lessons on wealth, greed, and happiness through short stories about people\'s relationship with money.' },
  { title: 'Deep Work', author: 'Cal Newport', isbn: '9781455586691', year: 2016, pages: 296, lang: 'english', genre: ['Self-Help', 'Business'], trending: false, nationality: 'American', desc: 'Rules for focused success in a distracted world. Learn to concentrate deeply on cognitively demanding tasks.' },
  { title: 'Rich Dad Poor Dad', author: 'Robert Kiyosaki', isbn: '9781612680194', year: 1997, pages: 336, lang: 'english', genre: ['Non-Fiction', 'Business'], trending: false, nationality: 'American', desc: 'What the rich teach their kids about money that the poor and middle class do not.' },
  { title: 'Think and Grow Rich', author: 'Napoleon Hill', isbn: '9781585424337', year: 1937, pages: 233, lang: 'english', genre: ['Self-Help', 'Classic'], trending: false, nationality: 'American', desc: 'The timeless classic on achieving success through desire, faith, and persistence.' },
  { title: 'The 7 Habits of Highly Effective People', author: 'Stephen Covey', isbn: '9781982137274', year: 1989, pages: 381, lang: 'english', genre: ['Self-Help', 'Business'], trending: false, nationality: 'American', desc: 'A holistic approach to personal and interpersonal effectiveness built on principles of fairness and integrity.' },
  { title: 'How to Win Friends and Influence People', author: 'Dale Carnegie', isbn: '9780671027032', year: 1936, pages: 288, lang: 'english', genre: ['Self-Help', 'Classic'], trending: false, nationality: 'American', desc: 'The original guide to building relationships and influencing others positively.' },

  // --- FICTION CLASSICS ---
  { title: 'Harry Potter and the Philosopher\'s Stone', author: 'J.K. Rowling', isbn: '9780747532699', year: 1997, pages: 223, lang: 'english', genre: ['Fiction', 'Fantasy', 'Young Adult'], trending: true, nationality: 'British', desc: 'An orphaned boy discovers he\'s a wizard and begins his education at Hogwarts School of Witchcraft and Wizardry.' },
  { title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '9780060935467', year: 1960, pages: 281, lang: 'english', genre: ['Fiction', 'Classic'], trending: false, nationality: 'American', desc: 'A young girl in Depression-era Alabama learns about justice and moral courage from her father, a lawyer defending a Black man.' },
  { title: '1984', author: 'George Orwell', isbn: '9780451524935', year: 1949, pages: 328, lang: 'english', genre: ['Fiction', 'Classic', 'Science Fiction'], trending: true, nationality: 'British', desc: 'A dystopian masterpiece about a totalitarian society where Big Brother controls every aspect of life.' },
  { title: 'Pride and Prejudice', author: 'Jane Austen', isbn: '9780141439518', year: 1813, pages: 279, lang: 'english', genre: ['Fiction', 'Classic', 'Romance'], trending: false, nationality: 'British', desc: 'The witty story of Elizabeth Bennet navigating love, class, and family in Regency-era England.' },
  { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '9780743273565', year: 1925, pages: 180, lang: 'english', genre: ['Fiction', 'Classic'], trending: false, nationality: 'American', desc: 'A mysterious millionaire\'s obsession with a beautiful woman captures the decadence and idealism of the Jazz Age.' },
  { title: 'Don Quixote', author: 'Miguel de Cervantes', isbn: '9780060934347', year: 1605, pages: 992, lang: 'english', genre: ['Fiction', 'Classic'], trending: false, nationality: 'Spanish', desc: 'The adventures of a delusional knight and his loyal squire in one of the greatest novels ever written.' },
  { title: 'The Lord of the Rings', author: 'J.R.R. Tolkien', isbn: '9780618640157', year: 1954, pages: 1178, lang: 'english', genre: ['Fiction', 'Fantasy'], trending: false, nationality: 'British', desc: 'An epic quest to destroy a powerful ring and save Middle-earth from the Dark Lord Sauron.' },
  { title: 'The Catcher in the Rye', author: 'J.D. Salinger', isbn: '9780316769488', year: 1951, pages: 214, lang: 'english', genre: ['Fiction', 'Classic'], trending: false, nationality: 'American', desc: 'A troubled teenager wanders New York City, grappling with alienation and the phoniness of the adult world.' },
  { title: 'The Alchemist', author: 'Paulo Coelho', isbn: '9780062315007', year: 1988, pages: 197, lang: 'english', genre: ['Fiction', 'Philosophy'], trending: true, nationality: 'Brazilian', desc: 'A shepherd boy journeys from Spain to Egypt in search of treasure and discovers his Personal Legend.' },

  // --- MODERN FICTION ---
  { title: 'The Midnight Library', author: 'Matt Haig', isbn: '9780525559474', year: 2020, pages: 304, lang: 'english', genre: ['Fiction'], trending: true, nationality: 'British', desc: 'Between life and death, a woman discovers a library where each book lets her live a different version of her life.' },
  { title: 'Dune', author: 'Frank Herbert', isbn: '9780441013593', year: 1965, pages: 688, lang: 'english', genre: ['Fiction', 'Science Fiction'], trending: true, nationality: 'American', desc: 'A young nobleman navigates politics, religion, and ecology on a desert planet that holds the universe\'s most precious resource.' },
  { title: 'The Hunger Games', author: 'Suzanne Collins', isbn: '9780439023481', year: 2008, pages: 374, lang: 'english', genre: ['Fiction', 'Young Adult', 'Science Fiction'], trending: false, nationality: 'American', desc: 'In a dystopian future, a teenager must fight to the death on live television in a brutal annual competition.' },
  { title: 'The Fault in Our Stars', author: 'John Green', isbn: '9780525478812', year: 2012, pages: 313, lang: 'english', genre: ['Fiction', 'Young Adult', 'Romance'], trending: false, nationality: 'American', desc: 'Two teenagers with cancer fall in love and embark on a life-affirming journey to Amsterdam.' },
  { title: 'Ready Player One', author: 'Ernest Cline', isbn: '9780307887436', year: 2011, pages: 374, lang: 'english', genre: ['Fiction', 'Science Fiction'], trending: false, nationality: 'American', desc: 'In a bleak future, a teenager hunts for a hidden Easter egg in a vast virtual reality world.' },
  { title: 'The Martian', author: 'Andy Weir', isbn: '9780553418026', year: 2014, pages: 369, lang: 'english', genre: ['Fiction', 'Science Fiction'], trending: false, nationality: 'American', desc: 'An astronaut stranded on Mars must use his ingenuity to survive until rescue arrives.' },
  { title: 'Demon Copperhead', author: 'Barbara Kingsolver', isbn: '9780063251922', year: 2022, pages: 560, lang: 'english', genre: ['Fiction'], trending: false, nationality: 'American', desc: 'A modern retelling of David Copperfield set in the opioid crisis of Appalachia.' },
  { title: 'The Seven Husbands of Evelyn Hugo', author: 'Taylor Jenkins Reid', isbn: '9781501161933', year: 2017, pages: 400, lang: 'english', genre: ['Fiction', 'Romance'], trending: true, nationality: 'American', desc: 'A reclusive Hollywood star finally tells the story of her glamorous and scandalous life through seven marriages.' },

  // --- THRILLERS / MYSTERY ---
  { title: 'Death on the Nile', author: 'Agatha Christie', isbn: '9780062073556', year: 1937, pages: 352, lang: 'english', genre: ['Fiction', 'Mystery', 'Thriller'], trending: false, nationality: 'British', desc: 'Hercule Poirot investigates a murder aboard a glamorous Nile steamer in this classic whodunit.' },
  { title: 'Inferno', author: 'Dan Brown', isbn: '9780385537858', year: 2013, pages: 461, lang: 'english', genre: ['Fiction', 'Thriller'], trending: false, nationality: 'American', desc: 'Robert Langdon races across Europe to prevent a madman from unleashing a global plague.' },
  { title: 'The Girl with the Dragon Tattoo', author: 'Stieg Larsson', isbn: '9780307454546', year: 2005, pages: 465, lang: 'english', genre: ['Fiction', 'Thriller', 'Mystery'], trending: false, nationality: 'Swedish', desc: 'A journalist and a brilliant hacker investigate a decades-old disappearance in a wealthy Swedish family.' },

  // --- NON-FICTION ---
  { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', isbn: '9780374533557', year: 2011, pages: 499, lang: 'english', genre: ['Non-Fiction', 'Psychology'], trending: false, nationality: 'Israeli-American', desc: 'A Nobel laureate explores the two systems that drive the way we think: fast intuition and slow deliberation.' },
  { title: 'Educated', author: 'Tara Westover', isbn: '9780399590504', year: 2018, pages: 334, lang: 'english', genre: ['Non-Fiction', 'Biography'], trending: false, nationality: 'American', desc: 'A memoir of a woman who grew up in a survivalist family in Idaho and eventually earned a PhD from Cambridge.' },
  { title: 'The Subtle Art of Not Giving a F*ck', author: 'Mark Manson', isbn: '9780062457714', year: 2016, pages: 224, lang: 'english', genre: ['Self-Help', 'Non-Fiction'], trending: true, nationality: 'American', desc: 'A counterintuitive approach to living a good life by caring less about more and focusing on what truly matters.' },
  { title: 'Ikigai', author: 'Héctor García', isbn: '9780143130727', year: 2017, pages: 208, lang: 'english', genre: ['Self-Help', 'Philosophy'], trending: true, nationality: 'Spanish', desc: 'The Japanese secret to a long and happy life — finding your purpose at the intersection of passion and profession.' },
];

// ============================================
// MAIN SEEDING FUNCTION
// ============================================
async function seed() {
  console.log('🚀 Seeding AllAboutbooks V2...\n');

  let added = 0, failed = 0;

  for (let i = 0; i < books.length; i++) {
    const b = books[i];
    process.stdout.write(`[${i + 1}/${books.length}] ${b.title}... `);

    try {
      // Get or create author
      const authorId = await getOrCreateAuthor(b.author, b.nationality);
      if (!authorId) { console.log('AUTHOR FAIL'); failed++; continue; }

      // Get verified cover
      const cover = await getCover(b.isbn, b.title);
      if (!cover) { console.log('NO COVER - skipping'); failed++; continue; }

      // Check duplicate
      const { data: existing } = await sb.from('books').select('id').eq('isbn', b.isbn).single();
      if (existing) { console.log('DUPLICATE'); continue; }

      // Insert book
      const { error } = await sb.from('books').insert({
        title: b.title,
        author_id: authorId,
        language: b.lang,
        description: b.desc,
        cover_url: cover,
        published_year: b.year,
        genre: b.genre,
        pages: b.pages,
        isbn: b.isbn,
        trending: b.trending,
      });

      if (error) { console.log('DB ERROR: ' + error.message); failed++; }
      else { console.log('✅'); added++; }
    } catch (err) {
      console.log('ERROR: ' + err.message);
      failed++;
    }

    // Rate limit Google API
    await new Promise(r => setTimeout(r, 300));
  }

  console.log('\n=============================');
  console.log(`✅ Added: ${added}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('=============================');
  console.log('\n🎉 Done! Start your dev server: npm run dev');
}

seed().then(() => process.exit(0));
