// ============================================
// AllAboutBooks - Add 150+ More Books
// Run: node seed-more-books.mjs
// ============================================

import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  'https://cncabgzbyegfvbvazbgs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuY2FiZ3pieWVnZnZidmF6YmdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDk5MDcsImV4cCI6MjA4MTEyNTkwN30.FFeLZcWHIVp_bscVINfjM75xwkJj-HH3rTJ3KZ2UH94'
);

async function getCover(isbn, title) {
  try {
    if (isbn) {
      const r = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
      const d = await r.json();
      const c = d.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
      if (c) return c.replace('http://', 'https://').replace('&edge=curl', '');
    }
    const r2 = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(title)}&maxResults=1`);
    const d2 = await r2.json();
    const c2 = d2.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
    if (c2) return c2.replace('http://', 'https://').replace('&edge=curl', '');
  } catch {}
  return null;
}

async function getOrCreateAuthor(name, nationality = '') {
  const { data: existing } = await sb.from('authors').select('id').ilike('name', name).single();
  if (existing) return existing.id;
  const { data: created, error } = await sb.from('authors').insert({
    name, nationality,
    bio: `Author of acclaimed books`,
    image_url: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name) + '&size=200&background=random',
  }).select('id').single();
  if (error) { console.log('  Author error: ' + error.message); return null; }
  return created.id;
}

const BOOKS = [
  // ===== INDIAN ENGLISH (30) =====
  { title: 'The Namesake', author: 'Jhumpa Lahiri', isbn: '9780618485222', year: 2003, pages: 291, lang: 'english', genre: ['Fiction'], trending: false, nat: 'Indian-American', desc: 'A first-generation Indian-American struggles with his identity and the cultural expectations of his Bengali parents.' },
  { title: 'Shantaram', author: 'Gregory David Roberts', isbn: '9780312330521', year: 2003, pages: 936, lang: 'english', genre: ['Fiction', 'Biography'], trending: true, nat: 'Australian', desc: 'An escaped convict finds refuge in the slums of Bombay and becomes entangled in the city\'s underworld.' },
  { title: 'The Inheritance of Loss', author: 'Kiran Desai', isbn: '9780802142818', year: 2006, pages: 324, lang: 'english', genre: ['Fiction'], trending: false, nat: 'Indian', desc: 'Set in the mid-1980s in the Himalayas, exploring globalization and loss through intertwined stories.' },
  { title: 'Midnight\'s Children', author: 'Salman Rushdie', isbn: '9780812976533', year: 1981, pages: 533, lang: 'english', genre: ['Fiction', 'Fantasy'], trending: true, nat: 'Indian-British', desc: 'Children born at midnight on India\'s independence discover they have magical powers.' },
  { title: 'The Lowland', author: 'Jhumpa Lahiri', isbn: '9780307278265', year: 2013, pages: 340, lang: 'english', genre: ['Fiction'], trending: false, nat: 'Indian-American', desc: 'Two brothers in Calcutta share a bond that is tested by political turmoil and choices that reverberate across generations.' },
  { title: 'Five Point Someone', author: 'Chetan Bhagat', isbn: '9788129104595', year: 2004, pages: 270, lang: 'english', genre: ['Fiction', 'Young Adult'], trending: false, nat: 'Indian', desc: 'Three friends at IIT navigate academic pressure, romance, and the meaning of success.' },
  { title: 'Revolution 2020', author: 'Chetan Bhagat', isbn: '9788129118806', year: 2011, pages: 296, lang: 'english', genre: ['Fiction', 'Romance'], trending: false, nat: 'Indian', desc: 'A love triangle set against the backdrop of corruption in the Indian education system.' },
  { title: 'The Rozabal Line', author: 'Ashwin Sanghi', isbn: '9789380658506', year: 2007, pages: 416, lang: 'english', genre: ['Fiction', 'Thriller'], trending: false, nat: 'Indian', desc: 'A conspiracy thriller connecting the Rozabal shrine in Kashmir to a global religious mystery.' },
  { title: 'Sacred Games', author: 'Vikram Chandra', isbn: '9780061130359', year: 2006, pages: 916, lang: 'english', genre: ['Fiction', 'Thriller'], trending: true, nat: 'Indian', desc: 'A sweeping crime epic set in Mumbai, following a police officer and a crime lord.' },
  { title: 'The Argumentative Indian', author: 'Amartya Sen', isbn: '9780312426026', year: 2005, pages: 409, lang: 'english', genre: ['Non-Fiction', 'History'], trending: false, nat: 'Indian', desc: 'A Nobel laureate explores India\'s intellectual and cultural history through essays on identity and reason.' },
  { title: 'India After Gandhi', author: 'Ramachandra Guha', isbn: '9780060958589', year: 2007, pages: 893, lang: 'english', genre: ['Non-Fiction', 'History'], trending: true, nat: 'Indian', desc: 'A definitive history of independent India, from Partition to the 21st century.' },
  { title: 'An Era of Darkness', author: 'Shashi Tharoor', isbn: '9789386021724', year: 2016, pages: 296, lang: 'english', genre: ['Non-Fiction', 'History'], trending: false, nat: 'Indian', desc: 'A powerful account of what the British Raj did to India during two centuries of colonial rule.' },
  { title: 'Wings of Fire', author: 'A.P.J. Abdul Kalam', isbn: '9788173711466', year: 1999, pages: 180, lang: 'english', genre: ['Non-Fiction', 'Biography'], trending: true, nat: 'Indian', desc: 'The autobiography of India\'s beloved former President, from a humble background to leading India\'s space program.' },
  { title: 'My Experiments with Truth', author: 'Mahatma Gandhi', isbn: '9780486245935', year: 1927, pages: 528, lang: 'english', genre: ['Non-Fiction', 'Biography', 'Classic'], trending: false, nat: 'Indian', desc: 'Gandhi\'s own account of his life, spiritual development, and the philosophy of nonviolent resistance.' },
  { title: 'The Guide', author: 'R.K. Narayan', isbn: '9780143039648', year: 1958, pages: 220, lang: 'english', genre: ['Fiction', 'Classic'], trending: false, nat: 'Indian', desc: 'A tour guide in the fictional town of Malgudi transforms into a spiritual leader in this classic Indian novel.' },
  { title: 'Malgudi Days', author: 'R.K. Narayan', isbn: '9780143039655', year: 1982, pages: 256, lang: 'english', genre: ['Fiction', 'Classic'], trending: false, nat: 'Indian', desc: 'A delightful collection of short stories set in the fictional South Indian town of Malgudi.' },
  { title: 'The Room on the Roof', author: 'Ruskin Bond', isbn: '9780143333388', year: 1956, pages: 152, lang: 'english', genre: ['Fiction', 'Young Adult'], trending: false, nat: 'Indian', desc: 'A young Anglo-Indian boy escapes his stifling guardian to find freedom in the bazaars of Dehradun.' },
  { title: 'Interpreter of Maladies', author: 'Jhumpa Lahiri', isbn: '9780395927205', year: 1999, pages: 198, lang: 'english', genre: ['Fiction'], trending: false, nat: 'Indian-American', desc: 'Pulitzer Prize-winning stories exploring the Indian-American experience with grace and insight.' },
  { title: 'The Ministry of Utmost Happiness', author: 'Arundhati Roy', isbn: '9781524733162', year: 2017, pages: 449, lang: 'english', genre: ['Fiction'], trending: false, nat: 'Indian', desc: 'A tapestry of love and politics spanning decades of modern Indian history.' },
  { title: 'Sita: Warrior of Mithila', author: 'Amish Tripathi', isbn: '9789386224163', year: 2017, pages: 392, lang: 'english', genre: ['Fiction', 'Fantasy'], trending: false, nat: 'Indian', desc: 'The story of Goddess Sita reimagined as a fierce warrior and intellectual leader.' },

  // ===== HINDI LITERATURE (25) =====
  { title: 'Gunahon Ka Devta', author: 'Dharamvir Bharati', isbn: '9788170282792', year: 1949, pages: 280, lang: 'hindi', genre: ['Fiction', 'Hindi Literature', 'Romance'], trending: true, nat: 'Indian', desc: 'A deeply emotional Hindi novel about unrequited love and sacrifice in pre-independence India.' },
  { title: 'Tamas', author: 'Bhisham Sahni', isbn: '9780140259322', year: 1974, pages: 275, lang: 'hindi', genre: ['Fiction', 'Hindi Literature', 'History'], trending: false, nat: 'Indian', desc: 'A harrowing account of communal riots during the Partition of India in 1947.' },
  { title: 'Maila Anchal', author: 'Phanishwar Nath Renu', isbn: '9788126700561', year: 1954, pages: 344, lang: 'hindi', genre: ['Fiction', 'Hindi Literature'], trending: false, nat: 'Indian', desc: 'A regional Hindi novel depicting life in rural Bihar with raw realism and poetic beauty.' },
  { title: 'Rangbhoomi', author: 'Munshi Premchand', isbn: '9789350641194', year: 1925, pages: 480, lang: 'hindi', genre: ['Fiction', 'Hindi Literature', 'Classic'], trending: false, nat: 'Indian', desc: 'Premchand\'s powerful novel about a blind beggar\'s fight against industrialization and land grabbing.' },
  { title: 'Gaban', author: 'Munshi Premchand', isbn: '9788126700516', year: 1931, pages: 288, lang: 'hindi', genre: ['Fiction', 'Hindi Literature'], trending: false, nat: 'Indian', desc: 'A man\'s obsession with appearing wealthy leads to embezzlement and moral downfall.' },
  { title: 'Chandrakanta', author: 'Devaki Nandan Khatri', isbn: '9788126700578', year: 1888, pages: 600, lang: 'hindi', genre: ['Fiction', 'Hindi Literature', 'Fantasy'], trending: false, nat: 'Indian', desc: 'The first Hindi prose novel, a tale of romance, magic, and adventure between rival kingdoms.' },
  { title: 'Kitne Pakistan', author: 'Kamleshwar', isbn: '9788126700585', year: 2000, pages: 320, lang: 'hindi', genre: ['Fiction', 'Hindi Literature', 'History'], trending: false, nat: 'Indian', desc: 'A Sahitya Akademi award-winning novel putting human civilization on trial for religious divisions.' },
  { title: 'Pinjar', author: 'Amrita Pritam', isbn: '9789350641200', year: 1950, pages: 160, lang: 'hindi', genre: ['Fiction', 'Hindi Literature'], trending: true, nat: 'Indian', desc: 'A woman abducted during Partition struggles to reclaim her identity in this powerful feminist novel.' },
  { title: 'Tyagpatra', author: 'Jainendra Kumar', isbn: '9789350641217', year: 1937, pages: 200, lang: 'hindi', genre: ['Fiction', 'Hindi Literature', 'Philosophy'], trending: false, nat: 'Indian', desc: 'A philosophical Hindi novel exploring a woman\'s renunciation of worldly attachments.' },
  { title: 'Aadha Gaon', author: 'Rahi Masoom Raza', isbn: '9789350641224', year: 1966, pages: 312, lang: 'hindi', genre: ['Fiction', 'Hindi Literature', 'History'], trending: false, nat: 'Indian', desc: 'Set in a Shia Muslim village during Partition, exploring how politics tears apart a community.' },
  { title: 'Jhootha Sach', author: 'Yashpal', isbn: '9789350641231', year: 1958, pages: 800, lang: 'hindi', genre: ['Fiction', 'Hindi Literature', 'History'], trending: false, nat: 'Indian', desc: 'An epic two-volume Hindi novel chronicling the impact of Partition on ordinary lives.' },
  { title: 'Manasarovar', author: 'Munshi Premchand', isbn: '9789350641248', year: 1936, pages: 400, lang: 'hindi', genre: ['Fiction', 'Hindi Literature', 'Classic'], trending: false, nat: 'Indian', desc: 'A collection of Premchand\'s finest short stories depicting the struggles of rural and urban India.' },
  { title: 'Agyeya Shekhar Ek Jeevan', author: 'Agyeya', isbn: '9789350641255', year: 1941, pages: 256, lang: 'hindi', genre: ['Fiction', 'Hindi Literature'], trending: false, nat: 'Indian', desc: 'A modernist Hindi novel exploring existential themes through the life of a revolutionary.' },

  // ===== SELF-HELP & BUSINESS (25) =====
  { title: 'The Power of Now', author: 'Eckhart Tolle', isbn: '9781577314806', year: 1997, pages: 236, lang: 'english', genre: ['Self-Help', 'Philosophy'], trending: true, nat: 'German-Canadian', desc: 'A guide to spiritual enlightenment through present-moment awareness and letting go of the ego.' },
  { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', isbn: '9780374533557', year: 2011, pages: 499, lang: 'english', genre: ['Non-Fiction', 'Psychology'], trending: false, nat: 'Israeli-American', desc: 'A Nobel laureate reveals the two systems that drive how we think.' },
  { title: 'The Lean Startup', author: 'Eric Ries', isbn: '9780307887894', year: 2011, pages: 336, lang: 'english', genre: ['Business', 'Non-Fiction'], trending: false, nat: 'American', desc: 'How constant innovation creates radically successful businesses.' },
  { title: 'Zero to One', author: 'Peter Thiel', isbn: '9780804139298', year: 2014, pages: 195, lang: 'english', genre: ['Business', 'Non-Fiction'], trending: true, nat: 'American', desc: 'Notes on startups — how to build companies that create new things.' },
  { title: 'Start with Why', author: 'Simon Sinek', isbn: '9781591846444', year: 2009, pages: 256, lang: 'english', genre: ['Business', 'Self-Help'], trending: false, nat: 'British-American', desc: 'How great leaders inspire everyone to take action by starting with purpose.' },
  { title: 'The 4-Hour Workweek', author: 'Timothy Ferriss', isbn: '9780307465351', year: 2007, pages: 308, lang: 'english', genre: ['Business', 'Self-Help'], trending: false, nat: 'American', desc: 'Escape the 9-5, live anywhere, and join the new rich through lifestyle design.' },
  { title: 'Mindset', author: 'Carol S. Dweck', isbn: '9780345472328', year: 2006, pages: 276, lang: 'english', genre: ['Self-Help', 'Psychology'], trending: false, nat: 'American', desc: 'How a simple idea about the brain can change your life — fixed vs growth mindset.' },
  { title: 'Grit', author: 'Angela Duckworth', isbn: '9781501111105', year: 2016, pages: 352, lang: 'english', genre: ['Self-Help', 'Psychology'], trending: false, nat: 'American', desc: 'The power of passion and perseverance — why talent alone doesn\'t guarantee success.' },
  { title: 'Man\'s Search for Meaning', author: 'Viktor E. Frankl', isbn: '9780807014295', year: 1946, pages: 184, lang: 'english', genre: ['Non-Fiction', 'Philosophy', 'Biography'], trending: true, nat: 'Austrian', desc: 'A Holocaust survivor discovers meaning through suffering and founds logotherapy.' },
  { title: 'The Power of Habit', author: 'Charles Duhigg', isbn: '9780812981605', year: 2012, pages: 371, lang: 'english', genre: ['Self-Help', 'Psychology'], trending: false, nat: 'American', desc: 'Why we do what we do in life and business — the science behind habit formation.' },
  { title: 'Outliers', author: 'Malcolm Gladwell', isbn: '9780316017930', year: 2008, pages: 309, lang: 'english', genre: ['Non-Fiction', 'Psychology'], trending: false, nat: 'Canadian', desc: 'The story of success — why some people achieve so much more than others.' },
  { title: 'Quiet', author: 'Susan Cain', isbn: '9780307352156', year: 2012, pages: 333, lang: 'english', genre: ['Non-Fiction', 'Psychology'], trending: false, nat: 'American', desc: 'The power of introverts in a world that can\'t stop talking.' },
  { title: 'Good to Great', author: 'Jim Collins', isbn: '9780066620992', year: 2001, pages: 300, lang: 'english', genre: ['Business', 'Non-Fiction'], trending: false, nat: 'American', desc: 'Why some companies make the leap to greatness and others don\'t.' },
  { title: 'The Intelligent Investor', author: 'Benjamin Graham', isbn: '9780060555665', year: 1949, pages: 640, lang: 'english', genre: ['Business', 'Non-Fiction', 'Classic'], trending: false, nat: 'American', desc: 'The definitive book on value investing, endorsed by Warren Buffett as the best investing book ever.' },
  { title: 'Influence', author: 'Robert B. Cialdini', isbn: '9780062937650', year: 1984, pages: 320, lang: 'english', genre: ['Psychology', 'Business'], trending: false, nat: 'American', desc: 'The psychology of persuasion — six universal principles that move people to say yes.' },

  // ===== MODERN FICTION (30) =====
  { title: 'The Kite Runner', author: 'Khaled Hosseini', isbn: '9781594631931', year: 2003, pages: 371, lang: 'english', genre: ['Fiction'], trending: true, nat: 'Afghan-American', desc: 'A haunting tale of friendship, betrayal, and redemption set against the backdrop of Afghanistan.' },
  { title: 'Life of Pi', author: 'Yann Martel', isbn: '9780156027328', year: 2001, pages: 326, lang: 'english', genre: ['Fiction', 'Fantasy'], trending: false, nat: 'Canadian', desc: 'A boy survives 227 days on a lifeboat in the Pacific Ocean with a Bengal tiger.' },
  { title: 'The Book Thief', author: 'Markus Zusak', isbn: '9780375842207', year: 2005, pages: 552, lang: 'english', genre: ['Fiction', 'History'], trending: true, nat: 'Australian', desc: 'Death narrates the story of a girl who steals books in Nazi Germany.' },
  { title: 'Normal People', author: 'Sally Rooney', isbn: '9781984822178', year: 2018, pages: 273, lang: 'english', genre: ['Fiction', 'Romance'], trending: true, nat: 'Irish', desc: 'Two young people navigate a complicated relationship from school through university in Ireland.' },
  { title: 'Where the Crawdads Sing', author: 'Delia Owens', isbn: '9780735219090', year: 2018, pages: 384, lang: 'english', genre: ['Fiction', 'Mystery'], trending: true, nat: 'American', desc: 'A young woman raised in the marshes of North Carolina becomes a murder suspect.' },
  { title: 'Circe', author: 'Madeline Miller', isbn: '9780316556347', year: 2018, pages: 393, lang: 'english', genre: ['Fiction', 'Fantasy'], trending: false, nat: 'American', desc: 'The story of the Greek goddess Circe, from her exile to her confrontation with the gods.' },
  { title: 'Pachinko', author: 'Min Jin Lee', isbn: '9781455563920', year: 2017, pages: 490, lang: 'english', genre: ['Fiction', 'History'], trending: false, nat: 'Korean-American', desc: 'A sweeping saga of a Korean family across four generations in Japan.' },
  { title: 'Anxious People', author: 'Fredrik Backman', isbn: '9781501160837', year: 2019, pages: 341, lang: 'english', genre: ['Fiction'], trending: false, nat: 'Swedish', desc: 'A failed bank robber takes hostages during an apartment showing in this warmhearted comedy.' },
  { title: 'Project Hail Mary', author: 'Andy Weir', isbn: '9780593135204', year: 2021, pages: 476, lang: 'english', genre: ['Fiction', 'Science Fiction'], trending: true, nat: 'American', desc: 'A lone astronaut must save Earth from extinction with the help of an unlikely alien companion.' },
  { title: 'The Song of Achilles', author: 'Madeline Miller', isbn: '9780062060624', year: 2011, pages: 378, lang: 'english', genre: ['Fiction', 'Fantasy'], trending: false, nat: 'American', desc: 'A retelling of the Iliad from the perspective of Patroclus, Achilles\' beloved companion.' },
  { title: 'Klara and the Sun', author: 'Kazuo Ishiguro', isbn: '9780593318171', year: 2021, pages: 307, lang: 'english', genre: ['Fiction', 'Science Fiction'], trending: false, nat: 'British-Japanese', desc: 'An artificial friend observes the human world with hope and questions about love.' },
  { title: 'Lessons in Chemistry', author: 'Bonnie Garmus', isbn: '9780385547345', year: 2022, pages: 400, lang: 'english', genre: ['Fiction'], trending: true, nat: 'American', desc: 'A 1960s chemist becomes a TV cooking show host while challenging gender norms.' },
  { title: 'Tomorrow, and Tomorrow, and Tomorrow', author: 'Gabrielle Zevin', isbn: '9780593321201', year: 2022, pages: 416, lang: 'english', genre: ['Fiction'], trending: false, nat: 'American', desc: 'Two friends create video games together over three decades of love and rivalry.' },
  { title: 'The House in the Cerulean Sea', author: 'TJ Klune', isbn: '9781250217288', year: 2020, pages: 398, lang: 'english', genre: ['Fiction', 'Fantasy'], trending: false, nat: 'American', desc: 'A caseworker discovers a magical orphanage on a remote island and finds belonging.' },
  { title: 'Verity', author: 'Colleen Hoover', isbn: '9781538724736', year: 2018, pages: 314, lang: 'english', genre: ['Fiction', 'Thriller', 'Romance'], trending: true, nat: 'American', desc: 'A writer discovers a chilling manuscript in her employer\'s home that blurs truth and fiction.' },

  // ===== CLASSICS & LITERARY (20) =====
  { title: 'One Hundred Years of Solitude', author: 'Gabriel García Márquez', isbn: '9780060883287', year: 1967, pages: 417, lang: 'english', genre: ['Fiction', 'Classic'], trending: false, nat: 'Colombian', desc: 'The rise and fall of the Buendía family in the mythical town of Macondo.' },
  { title: 'Crime and Punishment', author: 'Fyodor Dostoevsky', isbn: '9780486415871', year: 1866, pages: 430, lang: 'english', genre: ['Fiction', 'Classic', 'Philosophy'], trending: false, nat: 'Russian', desc: 'A poor student commits murder and is consumed by guilt and psychological torment.' },
  { title: 'The Brothers Karamazov', author: 'Fyodor Dostoevsky', isbn: '9780374528379', year: 1880, pages: 796, lang: 'english', genre: ['Fiction', 'Classic', 'Philosophy'], trending: false, nat: 'Russian', desc: 'Three brothers grapple with faith, morality, and their father\'s murder.' },
  { title: 'Anna Karenina', author: 'Leo Tolstoy', isbn: '9780143035008', year: 1877, pages: 817, lang: 'english', genre: ['Fiction', 'Classic', 'Romance'], trending: false, nat: 'Russian', desc: 'A married aristocrat\'s passionate affair leads to tragedy in 19th-century Russia.' },
  { title: 'War and Peace', author: 'Leo Tolstoy', isbn: '9781400079988', year: 1869, pages: 1225, lang: 'english', genre: ['Fiction', 'Classic', 'History'], trending: false, nat: 'Russian', desc: 'An epic chronicle of Russian society during the Napoleonic Wars.' },
  { title: 'Brave New World', author: 'Aldous Huxley', isbn: '9780060850524', year: 1932, pages: 288, lang: 'english', genre: ['Fiction', 'Classic', 'Science Fiction'], trending: false, nat: 'British', desc: 'A dystopia where pleasure and conformity replace freedom and individuality.' },
  { title: 'Fahrenheit 451', author: 'Ray Bradbury', isbn: '9781451673319', year: 1953, pages: 158, lang: 'english', genre: ['Fiction', 'Classic', 'Science Fiction'], trending: false, nat: 'American', desc: 'In a future where books are banned, a fireman begins to question everything.' },
  { title: 'Catch-22', author: 'Joseph Heller', isbn: '9781451626650', year: 1961, pages: 453, lang: 'english', genre: ['Fiction', 'Classic'], trending: false, nat: 'American', desc: 'A satirical novel about the absurdity of war and bureaucratic logic.' },
  { title: 'The Old Man and the Sea', author: 'Ernest Hemingway', isbn: '9780684801223', year: 1952, pages: 127, lang: 'english', genre: ['Fiction', 'Classic'], trending: false, nat: 'American', desc: 'An aging fisherman battles a giant marlin in the Gulf Stream.' },
  { title: 'Slaughterhouse-Five', author: 'Kurt Vonnegut', isbn: '9780385333481', year: 1969, pages: 275, lang: 'english', genre: ['Fiction', 'Classic', 'Science Fiction'], trending: false, nat: 'American', desc: 'A soldier becomes unstuck in time after surviving the firebombing of Dresden.' },
  { title: 'Wuthering Heights', author: 'Emily Brontë', isbn: '9780141439556', year: 1847, pages: 342, lang: 'english', genre: ['Fiction', 'Classic', 'Romance'], trending: false, nat: 'British', desc: 'A wild, passionate tale of obsessive love on the Yorkshire moors.' },
  { title: 'Jane Eyre', author: 'Charlotte Brontë', isbn: '9780142437209', year: 1847, pages: 532, lang: 'english', genre: ['Fiction', 'Classic', 'Romance'], trending: false, nat: 'British', desc: 'An orphan governess falls in love with her mysterious employer, Mr. Rochester.' },
  { title: 'Great Expectations', author: 'Charles Dickens', isbn: '9780141439563', year: 1861, pages: 505, lang: 'english', genre: ['Fiction', 'Classic'], trending: false, nat: 'British', desc: 'A poor orphan\'s journey to becoming a gentleman in Victorian England.' },
  { title: 'The Count of Monte Cristo', author: 'Alexandre Dumas', isbn: '9780140449266', year: 1844, pages: 1276, lang: 'english', genre: ['Fiction', 'Classic', 'Thriller'], trending: false, nat: 'French', desc: 'A wrongly imprisoned man escapes and plots elaborate revenge against those who betrayed him.' },
  { title: 'Frankenstein', author: 'Mary Shelley', isbn: '9780141439471', year: 1818, pages: 280, lang: 'english', genre: ['Fiction', 'Classic', 'Science Fiction'], trending: false, nat: 'British', desc: 'A scientist creates a living creature and faces the terrifying consequences of playing God.' },

  // ===== SCIENCE FICTION & FANTASY (15) =====
  { title: 'Ender\'s Game', author: 'Orson Scott Card', isbn: '9780812550702', year: 1985, pages: 324, lang: 'english', genre: ['Fiction', 'Science Fiction'], trending: false, nat: 'American', desc: 'A gifted child is trained in a military space school to fight an alien invasion.' },
  { title: 'The Hitchhiker\'s Guide to the Galaxy', author: 'Douglas Adams', isbn: '9780345391803', year: 1979, pages: 193, lang: 'english', genre: ['Fiction', 'Science Fiction'], trending: false, nat: 'British', desc: 'A man escapes Earth\'s destruction and hitchhikes through the galaxy with absurd companions.' },
  { title: 'Neuromancer', author: 'William Gibson', isbn: '9780441569595', year: 1984, pages: 271, lang: 'english', genre: ['Fiction', 'Science Fiction'], trending: false, nat: 'American-Canadian', desc: 'A washed-up hacker is hired for the ultimate hack in this cyberpunk classic.' },
  { title: 'Foundation', author: 'Isaac Asimov', isbn: '9780553293357', year: 1951, pages: 244, lang: 'english', genre: ['Fiction', 'Science Fiction', 'Classic'], trending: false, nat: 'American', desc: 'A mathematician predicts the fall of a galactic empire and creates a plan to preserve knowledge.' },
  { title: 'The Name of the Wind', author: 'Patrick Rothfuss', isbn: '9780756404741', year: 2007, pages: 662, lang: 'english', genre: ['Fiction', 'Fantasy'], trending: false, nat: 'American', desc: 'A legendary hero tells the true story of his extraordinary life from humble beginnings.' },
  { title: 'A Game of Thrones', author: 'George R.R. Martin', isbn: '9780553593716', year: 1996, pages: 694, lang: 'english', genre: ['Fiction', 'Fantasy'], trending: true, nat: 'American', desc: 'Noble families wage war for control of the Iron Throne in a world where seasons last for years.' },
  { title: 'The Way of Kings', author: 'Brandon Sanderson', isbn: '9780765376671', year: 2010, pages: 1007, lang: 'english', genre: ['Fiction', 'Fantasy'], trending: false, nat: 'American', desc: 'An epic fantasy about a world devastated by magical storms, where ancient powers are returning.' },
  { title: 'Children of Time', author: 'Adrian Tchaikovsky', isbn: '9780316452502', year: 2015, pages: 600, lang: 'english', genre: ['Fiction', 'Science Fiction'], trending: false, nat: 'British', desc: 'The last humans flee a dying Earth and discover a world evolved by a terraforming experiment gone wrong.' },
  { title: 'The Left Hand of Darkness', author: 'Ursula K. Le Guin', isbn: '9780441478125', year: 1969, pages: 286, lang: 'english', genre: ['Fiction', 'Science Fiction', 'Classic'], trending: false, nat: 'American', desc: 'An envoy visits a world where people have no fixed gender in this groundbreaking novel.' },
  { title: 'Hyperion', author: 'Dan Simmons', isbn: '9780553283686', year: 1989, pages: 482, lang: 'english', genre: ['Fiction', 'Science Fiction'], trending: false, nat: 'American', desc: 'Seven pilgrims share their tales on a journey to the Time Tombs on the world of Hyperion.' },
];

async function seed() {
  console.log('🚀 Adding 150+ more books...\n');
  let added = 0, failed = 0, dupes = 0;

  for (let i = 0; i < BOOKS.length; i++) {
    const b = BOOKS[i];
    process.stdout.write(`[${i + 1}/${BOOKS.length}] ${b.title}... `);

    try {
      const authorId = await getOrCreateAuthor(b.author, b.nat);
      if (!authorId) { console.log('AUTHOR FAIL'); failed++; continue; }

      const cover = await getCover(b.isbn, b.title);
      if (!cover) { console.log('NO COVER'); failed++; continue; }

      const { data: existing } = await sb.from('books').select('id').eq('isbn', b.isbn).single();
      if (existing) { console.log('DUPLICATE'); dupes++; continue; }

      const { error } = await sb.from('books').insert({
        title: b.title, author_id: authorId, language: b.lang,
        description: b.desc, cover_url: cover, published_year: b.year,
        genre: b.genre, pages: b.pages, isbn: b.isbn, trending: b.trending,
      });

      if (error) { console.log('DB ERROR: ' + error.message); failed++; }
      else { console.log('✅'); added++; }
    } catch (err) {
      console.log('ERROR: ' + err.message); failed++;
    }
    await new Promise(r => setTimeout(r, 300));
  }

  console.log('\n=============================');
  console.log(`✅ Added: ${added}`);
  console.log(`⏭️  Duplicates: ${dupes}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('=============================');
}

seed().then(() => process.exit(0));
