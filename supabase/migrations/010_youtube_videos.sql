-- ============================================================
-- Devas Unlimited — Sanctuary YouTube videos (010)
-- ============================================================
-- Adds the official Devas Unlimited YouTube videos to the
-- Sanctuary "Watch" tab. Play opens each video on YouTube.
-- Titles, durations, dates and descriptions come from YouTube;
-- tags hold the topic label (Satsang, Kirtan, Chants, ...).
-- Safe to re-run: existing rows are updated in place.
-- ============================================================

insert into public.resources
  (id, title, category, provider, external_url, thumbnail_url, duration_minutes, tags, description, facilitator_name, is_featured, is_published, status, display_order, published_at)
values
  (
    'd1e2f3a4-0001-0000-0000-000000000001',
    'From Mantra to Ananda: The Power of Nama Japa',
    'watch', 'youtube',
    'https://www.youtube.com/watch?v=Exmv32HzcCs',
    'https://i.ytimg.com/vi/Exmv32HzcCs/maxresdefault.jpg',
    8, array['Satsang'],
    $desc$What happens when the Divine Name doesn’t just stay on your lips, but begins to fill your entire being?

In this powerful session, we explore how to practise Nama Japa with awareness and devotion — going beyond simply counting malas or completing a number.

Learn how to:
✨ Chant the Divine Name with deeper awareness
✨ Allow the mantra to reach every part of your being
✨ Recognise when the mind becomes distracted
✨ Shift from quantity to quality in your chanting
✨ Experience the silence and inner stillness that can arise through sincere practice
✨ Move from individual identity towards a deeper feeling of oneness with the Divine

As the discussion beautifully explores, true chanting is not merely about how many times we repeat the Name — it is about how deeply we experience it.

🙏 Take a few moments, sit quietly, and experience the practice along with us.$desc$,
    'Devas Unlimited',
    true, true, 'published', 0, '2026-08-31T05:02:41-07:00'
  ),
  (
    'd1e2f3a4-0002-0000-0000-000000000002',
    'The Secret of Chanting Nobody Taught You',
    'watch', 'youtube',
    'https://www.youtube.com/watch?v=QS-n6H2bipQ',
    'https://i.ytimg.com/vi/QS-n6H2bipQ/maxresdefault.jpg',
    42, array['Satsang'],
    $desc$What if the true power of chanting isn't in repeating the mantra... but in the silence between each word?

In this profound satsang, Dr. Srikanth Sola reveals a simple yet transformative approach to Nama Japa (chanting God's name) that can quiet the mind, deepen your spiritual practice, and guide you toward Self-Realization.

Discover:
✨ Why most people chant the wrong way
✨ The hidden power of silence between every mantra
✨ How chanting can help dissolve stress, fear, and inner conflict
✨ Why "You are God having a dream" is more than a philosophy—it is an experience to awaken to
✨ Four powerful techniques to transform your chanting practice

This satsang is for anyone seeking inner peace, deeper meditation, devotion, and a direct experience of their true Self.$desc$,
    'Dr. Srikanth Sola',
    false, true, 'published', 0, '2026-08-04T03:08:07-07:00'
  ),
  (
    'd1e2f3a4-0003-0000-0000-000000000003',
    'The Truth About Attachment No One Talks About',
    'watch', 'youtube',
    'https://www.youtube.com/watch?v=ii7ElF3LtCU',
    'https://i.ytimg.com/vi/ii7ElF3LtCU/maxresdefault.jpg',
    35, array['Satsang'],
    $desc$What if the biggest obstacle to peace, spiritual growth, and liberation isn't the world around you—but the attachments within you?

In this powerful satsang, Dr. Srikanth Sola explores how attachment quietly binds us to suffering and the cycle of rebirth. Through inspiring stories, timeless wisdom from Bhagavan Sri Sathya Sai Baba, and practical spiritual guidance, you'll discover how to cultivate inner silence, receive God's love, and move closer to Self-realization.

✨ In this talk, you'll learn:
• Why attachment—not responsibility—is the real problem
• The story of King Bharata and the lesson every seeker must know
• How to silence the mind through daily sadhana
• The secret to overcoming attachment through love for God
• Why your last thoughts matter
• A simple guided exercise to identify and surrender your attachments
• How to experience Swami's unconditional love in everyday life

Whether you're new to spirituality or have been on the path for years, this satsang offers profound insights to help you live with greater freedom, peace, and awareness.$desc$,
    'Dr. Srikanth Sola',
    false, true, 'published', 0, '2026-07-27T03:36:11-07:00'
  ),
  (
    'd1e2f3a4-0004-0000-0000-000000000004',
    'Who Is Maa Varahi? The Hidden Truth About Gupt Navratri',
    'watch', 'youtube',
    'https://www.youtube.com/watch?v=qwL0O3ZGLGY',
    'https://i.ytimg.com/vi/qwL0O3ZGLGY/maxresdefault.jpg',
    24, array['Podcast'],
    $desc$Most people celebrate Navratri with devotion—but very few know about the sacred Gupta Navratri, also known as Varahi Navratri.

In this enlightening conversation, Shivani Sinha Sola shares the deeper spiritual significance of Goddess Varahi, one of the most powerful forms of Divine Shakti. Discover why this hidden Navratri is considered a sacred time for inner transformation, protection, courage, healing, and spiritual growth.

✨ In this podcast, you'll discover:

Who is Maa Varahi?
Why is it called Gupta (Hidden) Navratri?
The spiritual meaning of Varahi Sadhana
How Goddess Varahi removes inner obstacles and karmic patterns
The balance of spiritual practice and daily life
Simple practices anyone can do during Varahi Navratri
The power of the Varahi Gayatri Mantra

Whether you're new to spirituality or a long-time seeker, this conversation offers timeless wisdom to deepen your connection with the Divine Mother.$desc$,
    'Shivani Sinha Sola',
    false, true, 'published', 0, '2026-07-17T04:30:33-07:00'
  ),
  (
    'd1e2f3a4-0005-0000-0000-000000000005',
    'When Hearts Sing Together — Achutam Keshavam & Rama Nama',
    'watch', 'youtube',
    'https://www.youtube.com/watch?v=HmSt3JymXq0',
    'https://i.ytimg.com/vi/HmSt3JymXq0/maxresdefault.jpg',
    19, array['Kirtan'],
    $desc$Achutam Keshavam... Rama Narayanam...

A few voices began to sing.

Then the room started humming.

Then the hearts joined in.

And somewhere between the chanting of Rama Nama and the melodies of Krishna, time quietly disappeared.

This is not a performance.

This is not a concert.

This is a gathering of hearts remembering the Divine through sound.

Immerse yourself in the bliss of sacred sound as we sing the divine names of the Lord through soulful kirtans and bhajans. From the timeless melody of Achutam Keshavam to the powerful chanting of Rama Nama, this gathering is an invitation to experience devotion, joy, and inner peace through music.

✨ Featured Chants & Bhajans
• Achutam Keshavam
• Rama Nama Sankirtan
• Devotional Bhajans & Kirtans
• Collective Chanting & Divine Vibrations

Close your eyes.
Sing if you know the words.
Listen if you don't.

Let the Names do their work.

🙏 Rama.
🙏 Krishna.
🙏 Govinda.

May these sacred vibrations uplift your heart, bring peace to your mind, devotion to your heart, and joy to your soul.

✨ "Where the Divine Name is sung with love, the Divine Presence is felt." ✨$desc$,
    'Devas Unlimited',
    false, true, 'published', 0, '2026-06-23T04:31:51-07:00'
  ),
  (
    'd1e2f3a4-0006-0000-0000-000000000006',
    '3 Powerful Gems of Seva',
    'watch', 'youtube',
    'https://www.youtube.com/watch?v=eDVFHWhtOA0',
    'https://i.ytimg.com/vi/eDVFHWhtOA0/maxresdefault.jpg',
    28, array['Satsang'],
    $desc$What is the true purpose of seva? Is it simply helping others, or is there a deeper spiritual transformation taking place within us?

In this inspiring satsang, Dr. Srikanth Sola shares profound experiences and life-changing lessons on selfless service learned through the grace of Sri Sathya Sai Baba.

✨ In this talk, discover:

How to see God in every person you serve
Why every action should be done to please the Divine
The hidden spiritual power of sincere seva
Lessons from personal experiences in medical service
How seva transforms families and nurtures selflessness in children
Why service is not about changing others, but changing ourselves

Through touching stories, practical wisdom, and spiritual insights, this satsang reminds us that seva is one of the fastest paths to inner growth and divine grace.

💛 Key Message:
"Seva is not about helping others. God will take care of them. Seva is about you becoming better."$desc$,
    'Dr. Srikanth Sola',
    false, true, 'published', 0, '2026-06-16T04:32:10-07:00'
  ),
  (
    'd1e2f3a4-0007-0000-0000-000000000007',
    'Kirtan Vibing — Soulful Ganesha Kirtan',
    'watch', 'youtube',
    'https://www.youtube.com/watch?v=yLUZNtiditY',
    'https://i.ytimg.com/vi/yLUZNtiditY/maxresdefault.jpg',
    8, array['Kirtan'],
    $desc$A soulful evening of devotion, music, and divine vibrations 🕉✨

In this Kirtan Vibing session, we sang with love for Lord Ganesha — the remover of obstacles and giver of wisdom 🙏🐘

Let these sacred chants calm your mind, open your heart, and bring peace, positivity, and blessings into your space 💛🎶

Close your eyes, breathe deeply, and feel the divine energy of Ganesha.

Ganpati Bappa Morya 🙏🐘✨$desc$,
    'Devas Unlimited',
    false, true, 'published', 0, '2026-06-12T04:28:49-07:00'
  ),
  (
    'd1e2f3a4-0008-0000-0000-000000000008',
    '4 Powerful Steps to Hear the Divine Within — Part 2',
    'watch', 'youtube',
    'https://www.youtube.com/watch?v=1mwsj05x1vc',
    'https://i.ytimg.com/vi/1mwsj05x1vc/maxresdefault.jpg',
    30, array['Satsang'],
    $desc$You heard the silence…
now can you stay with it? 👀

Part 2 takes you further
into the space where patterns begin to lose control

Dr. Srikanth Sola shares how to
not fight thoughts… but outgrow them

✨ What unfolds here:

🔹 Witnessing without interference
🔹 Breaking unconscious loops
🔹 Detaching from mental noise
🔹 Turning awareness into a living practice
🔹 Experiencing stillness in motion

🌌 This is where real shift begins
not outside… but within

🙏 Don’t just listen…
observe what changes inside you$desc$,
    'Dr. Srikanth Sola',
    false, true, 'published', 0, '2026-04-17T00:13:47-07:00'
  ),
  (
    'd1e2f3a4-0009-0000-0000-000000000009',
    'Divine Darshan Stories from the Akashic Records — Part 2',
    'watch', 'youtube',
    'https://www.youtube.com/watch?v=7_o5oaHyae4',
    'https://i.ytimg.com/vi/7_o5oaHyae4/maxresdefault.jpg',
    26, array['Satsang'],
    $desc$In this Satsang – Divine Darshan Stories from the Akashic Records (Part 2), Dr. Srikanth Sola continues sharing deeper spiritual insights that guide seekers toward awareness, inner mastery, and connection with the Divine.

This session explores powerful spiritual practices and wisdom drawn from the Akashic Records and ancient teachings.

Key insights discussed in this session:

• The Thumb Meditation practice and its deeper spiritual significance
• Learning the art of Witnessing what is happening in the world without losing inner balance
• Understanding life as watching the Divine play of the Swamis and creation
• The Three Levels of Being a Witness and how consciousness evolves through them
• Practical guidance on how to control oneself and cultivate inner discipline
• The deeper meaning of Seva (selfless service) and how to serve with purity
• Practicing the Presence of God in daily life
• Powerful stories of Parshuram and the spiritual lessons they reveal
• Understanding Karma and its influence on our life journey
• Spiritual methods on how karmas can be reduced and dissolved
• The Cutting Ties Practice for releasing energetic and emotional attachments

This satsang invites seekers to move from reaction to awareness, from attachment to witnessing, and from ego to Divine presence.

✨ A powerful continuation for those walking the path of inner awakening.$desc$,
    'Dr. Srikanth Sola',
    false, true, 'published', 0, '2026-03-13T03:39:03-07:00'
  ),
  (
    'd1e2f3a4-0010-0000-0000-000000000010',
    'Practicing the Presence of God — Part 2',
    'watch', 'youtube',
    'https://www.youtube.com/watch?v=zmfJdu1NszY',
    'https://i.ytimg.com/vi/zmfJdu1NszY/maxresdefault.jpg',
    20, array['Satsang'],
    $desc$In this satsang, we continue our journey into Swami’s teachings—moving beyond concepts 🧠 and intellect 📚, and directly into the experience of His presence ✨🙏.

Building on insights from the recent Cutting the Ties that Bind retreat, this session explores why spiritual teachings can feel confusing or contradictory 🤔, and how true understanding unfolds naturally when we align with practice and grace 🌊💛. Drawing inspiration from Rumi and Shams, we uncover the four layers of spiritual insight 🌿🌊, like the flowing layers of a river.

You will explore:

🕊️ How personal experience shapes the understanding of the same teaching
🌟 The four levels of spiritual comprehension and their unfolding
💫 Why inner realization goes beyond intellectual knowledge
🧘 Practical ways to embody Swami’s presence in daily life
💖 A guided practice using Swami’s teaching:
“I am in you, around you, above you, below you. I am always with you.” ✨

This session gently guides you from contemplation 🌀 → feeling 💛 → living the teaching 🌈, helping you experience Swami’s presence more intimately and effortlessly.

Perfect for anyone seeking to deepen sadhana 🙏, cultivate inner stillness 🌸, and bring Swami’s words into everyday life 🌞.$desc$,
    'Dr. Srikanth Sola',
    false, true, 'published', 0, '2025-12-11T22:06:50-08:00'
  ),
  (
    'd1e2f3a4-0011-0000-0000-000000000011',
    'Karthik Maas Special: Shiv Sadhana — Awaken the Divine Within',
    'watch', 'youtube',
    'https://www.youtube.com/watch?v=T3J2lCIaQKM',
    'https://i.ytimg.com/vi/T3J2lCIaQKM/maxresdefault.jpg',
    37, array['Chants'],
    $desc$🕉️ Om Hreem Haum Namah Shivaya 🕉️
Begin your inner journey with the sacred vibrations of Lord Shiva.
This session opens with the powerful Shiva Beej Mantra — ॐ ह्रीं हौं नमः शिवाय, followed by Shiva Sankalpam Stotram and Shiva Manasa Pooja — a beautiful offering to Lord Shiva through the mind and heart.

🪔 These chants help you:
✨ Purify your thoughts and intentions
✨ Deepen your meditation and focus
✨ Invoke inner stillness and divine grace

🙏 Allow the sound vibrations to guide you inward — to the silence where Shiva resides.

📿 Chants Included:

Om Hreem Haum Namah Shivaya

Shiva Sankalpam Stotram

Shiva Manasa Pooja

🎧 Best experienced in a calm, meditative space.$desc$,
    'Devas Unlimited',
    false, true, 'published', 0, '2025-11-07T03:49:13-08:00'
  ),
  (
    'd1e2f3a4-0012-0000-0000-000000000012',
    'How to Suffer (With Style) — Part 1',
    'watch', 'youtube',
    'https://www.youtube.com/watch?v=jAdvK88r-eY',
    'https://i.ytimg.com/vi/jAdvK88r-eY/maxresdefault.jpg',
    20, array['Satsang'],
    $desc$In this talk, Dr. Srikanth Sola explores the hidden wisdom behind suffering — how our pain, when understood deeply, becomes a sacred doorway to transformation. With compassion and clarity, he shares how suffering—both internal and external—can guide us back to self-love, awareness, and freedom.

🌿 What you’ll discover in this talk:

✨ The deeper purpose behind human suffering
✨ How internal and external pain reflect our inner state
✨ Why we unconsciously get “addicted” to suffering — and how to stop
✨ The connection between self-love, awareness, and true healing
✨ How daily distractions — like mobile addiction — disconnect us from our inner peace
✨ Practical ways to transform pain into wisdom and surrender

This is not just a talk — it is an invitation to shift your relationship with pain. To see suffering not as punishment, but as your greatest teacher — leading you gently back to your divine nature.

💫 Rediscover peace, presence, and the art of living — even when life challenges you.$desc$,
    'Dr. Srikanth Sola',
    false, true, 'published', 0, '2025-11-04T22:52:45-08:00'
  ),
  (
    'd1e2f3a4-0013-0000-0000-000000000013',
    'How to Play with Swami Using the Maypole — Part 2',
    'watch', 'youtube',
    'https://www.youtube.com/watch?v=YoIR3VmZ3zM',
    'https://i.ytimg.com/vi/YoIR3VmZ3zM/maxresdefault.jpg',
    19, array['Practice'],
    $desc$In this video, Dr. Srikanth Sola continues to reveal how the Maypole practice transforms devotion into a living, joyful experience with Swami. Building on the teachings of Phyllis Krystal, he shows how the symbolic Maypole and the High C vibration can open the heart, dissolve inner blocks, and deepen your direct connection with the Divine.

✨ What you’ll explore in Part 2:

Advanced insights into the spiritual significance of the Maypole

How to engage in playful, heartfelt communion with Swami

The healing and attunement potential of the High C vibration

Practical guidance from the Phyllis Krystal Method to release limitations

Ways to integrate this sacred play into your daily spiritual practice

This session is more than a practice — it’s an invitation to rediscover your soul’s innocence, experience freedom, and bask in the joy of being fully present with Swami$desc$,
    'Dr. Srikanth Sola',
    false, true, 'published', 0, '2025-09-22T04:48:49-07:00'
  ),
  (
    'd1e2f3a4-0014-0000-0000-000000000014',
    'Unseen, Unasked, Unstoppable: How Grace Works — Part 1',
    'watch', 'youtube',
    'https://www.youtube.com/watch?v=CQmgWIYdi1E',
    'https://i.ytimg.com/vi/CQmgWIYdi1E/maxresdefault.jpg',
    20, array['Satsang'],
    $desc$There is a force silently guiding your life…
A presence that steps in when all else falls away…
This is Grace – the divine intelligence that works behind the scenes, beyond logic, and beyond deserving.

In this video, we explore:
✨ What is Grace?
🌿 How it operates even without asking
🙏 Why surrender invites more than striving ever can
💫 Real-life moments where Grace revealed its quiet power

You don’t have to earn it.
You don’t have to call it by name.
Grace is already here… working for you.$desc$,
    'Devas Unlimited',
    false, true, 'published', 0, '2025-07-30T03:09:20-07:00'
  ),
  (
    'd1e2f3a4-0015-0000-0000-000000000015',
    'Master Your Senses, Simplify Your Life',
    'watch', 'youtube',
    'https://www.youtube.com/watch?v=diCuRNo2Qj4',
    'https://i.ytimg.com/vi/diCuRNo2Qj4/maxresdefault.jpg',
    26, array['Satsang'],
    $desc$Master Your Senses, Simplify Your Life: Join Dr. Srikanth Sola as he shares profound insights to help you navigate life with clarity and ease. 🕉️✨$desc$,
    'Dr. Srikanth Sola',
    false, true, 'published', 0, '2024-12-06T03:30:33-08:00'
  ),
  (
    'd1e2f3a4-0016-0000-0000-000000000016',
    'Kaun Banega Gyanpati? Who Wants to Be a True Seeker — Part 1',
    'watch', 'youtube',
    'https://www.youtube.com/watch?v=HHkR8HGRy4Y',
    'https://i.ytimg.com/vi/HHkR8HGRy4Y/maxresdefault.jpg',
    20, array['Satsang'],
    $desc$Ready for the Challenge?
Kaun Banega Gyanpati | Who Wants to Be a True Seeker? Part 1 of 2 takes you on an exciting quiz adventure to test your spiritual wisdom. Who will emerge as the enlightened one?$desc$,
    'Dr. Srikanth Sola',
    false, true, 'published', 0, '2024-11-22T03:30:11-08:00'
  ),
  (
    'd1e2f3a4-0017-0000-0000-000000000017',
    'Awaken Peace — Affirmation Practice with Amethyst Deva',
    'watch', 'youtube',
    'https://www.youtube.com/watch?v=g1TKA3rUq2I',
    'https://i.ytimg.com/vi/g1TKA3rUq2I/maxresdefault.jpg',
    27, array['Practice'],
    $desc$Discover inner serenity with Awaken Peace — an affirmation practice with the Amethyst Deva. 🌺

Immerse yourself in 108 powerful affirmations for tranquillity and harmony, and let a deep, lasting peace settle within.$desc$,
    'Devas Unlimited',
    false, true, 'published', 0, '2024-05-22T04:30:17-07:00'
  ),
  (
    'd1e2f3a4-0018-0000-0000-000000000018',
    '3 Simple Steps to Reach Ultimate Silence',
    'watch', 'youtube',
    'https://www.youtube.com/watch?v=ja8Ci3n0kHo',
    'https://i.ytimg.com/vi/ja8Ci3n0kHo/maxresdefault.jpg',
    12, array['Practice'],
    $desc$Unlock the secrets of inner silence. 🌟

Join Shaguna Sinha as she shares an ancient technique passed down by her masters — three simple steps on the path to ultimate serenity.$desc$,
    'Shaguna Sinha',
    false, true, 'published', 0, '2024-05-17T04:30:20-07:00'
  ),
  (
    'd1e2f3a4-0019-0000-0000-000000000019',
    'How You Can Sit Quietly with God — Part 1',
    'watch', 'youtube',
    'https://www.youtube.com/watch?v=8bss-YweUkY',
    'https://i.ytimg.com/vi/8bss-YweUkY/maxresdefault.jpg',
    12, array['Satsang'],
    $desc$Join Dr. Srikanth Sola in an enlightening Sathsang as he shares insights on quiet contemplation with Swami. Part one of 3 part series, stay tuned for more! 🙏$desc$,
    'Dr. Srikanth Sola',
    false, true, 'published', 0, '2024-03-22T04:30:05-07:00'
  )
on conflict (id) do update set
  title            = excluded.title,
  category         = excluded.category,
  provider         = excluded.provider,
  external_url     = excluded.external_url,
  thumbnail_url    = excluded.thumbnail_url,
  duration_minutes = excluded.duration_minutes,
  tags             = excluded.tags,
  description      = excluded.description,
  facilitator_name = excluded.facilitator_name,
  is_featured      = excluded.is_featured,
  is_published     = excluded.is_published,
  status           = excluded.status,
  display_order    = excluded.display_order,
  published_at     = excluded.published_at,
  updated_at       = now();
