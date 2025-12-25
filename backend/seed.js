const { Pool } = require('pg');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const seed = async () => {
    try {
        console.log('Starting seed...');

        // 1. Clear existing data (Optional: Comment out if you want to append)
        // await pool.query('TRUNCATE TABLE Users CASCADE'); 
        // console.log('Cleared existing data.');

        // 1.5 Ensure Account Status exists
        await pool.query("INSERT INTO Account_Statuses (StatusID, StatusName) VALUES (1, 'Active') ON CONFLICT DO NOTHING");

        // 2. Create 20 Users
        const users = [];
        const passwordHash = await bcrypt.hash('password123', 10);

        for (let i = 0; i < 20; i++) {
            const email = faker.internet.email();
            const username = faker.internet.username().replace(/[^a-zA-Z0-9]/g, '').substring(0, 20); // Clean username

            const userRes = await pool.query(
                'INSERT INTO Users (Email, PasswordHash, UsernameUnique, StatusID) VALUES ($1, $2, $3, 1) RETURNING UserID',
                [email, passwordHash, username]
            );
            const userId = userRes.rows[0].userid;

            await pool.query(
                'INSERT INTO Profiles (UserID, DisplayName, Bio, AvatarURL) VALUES ($1, $2, $3, $4)',
                [userId, faker.person.fullName(), faker.lorem.sentence(), faker.image.avatar()]
            );

            users.push({ userId, username });
        }
        console.log(`Created ${users.length} users.`);

        // 3. Fetch Interests
        const interestRes = await pool.query('SELECT InterestID, InterestName FROM Interests');
        const allInterests = interestRes.rows;

        if (allInterests.length < 3) {
            console.log('Not enough interests in DB. Creating defaults...');
            const defaults = ['Tech', 'Art', 'Music', 'Sports', 'Food'];
            for (const name of defaults) {
                await pool.query('INSERT INTO Interests (InterestName) VALUES ($1) ON CONFLICT DO NOTHING', [name]);
            }
            // Re-fetch
            const res = await pool.query('SELECT InterestID, InterestName FROM Interests');
            allInterests.push(...res.rows);
        }

        // 4. Assign Interests and Create Posts
        for (const user of users) {
            // Pick 3 random interests
            const userInterests = faker.helpers.arrayElements(allInterests, 3);

            for (const interest of userInterests) {
                // Assign Interest
                await pool.query(
                    'INSERT INTO User_Interests (UserID, InterestID) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                    [user.userId, interest.interestid]
                );

                // Create 2 Posts for this interest
                for (let k = 0; k < 2; k++) {
                    const content = `${faker.lorem.paragraph()} #${interest.interestname.replace(/\s/g, '')}`;
                    const postRes = await pool.query(
                        'INSERT INTO Posts (UserID, ContentBody) VALUES ($1, $2) RETURNING PostID',
                        [user.userId, content]
                    );
                    const postId = postRes.rows[0].postid;

                    // Ensure Post_Counters (Handled by Trigger, but safe to verify)
                    // Add Hashtag
                    // First find or create hashtag
                    const tag = interest.interestname.replace(/\s/g, '');
                    let hashtagId;
                    const tagRes = await pool.query('SELECT HashtagID FROM Hashtags WHERE TagName = $1', [tag]);
                    if (tagRes.rows.length > 0) {
                        hashtagId = tagRes.rows[0].hashtagid;
                    } else {
                        const newTag = await pool.query('INSERT INTO Hashtags (TagName) VALUES ($1) RETURNING HashtagID', [tag]);
                        hashtagId = newTag.rows[0].hashtagid;
                    }

                    await pool.query(
                        'INSERT INTO Post_Hashtags (PostID, HashtagID) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                        [postId, hashtagId]
                    );
                }
            }
        }
        console.log('Assigned interests and created posts.');

        console.log('Seed complete!');
    } catch (error) {
        console.error('Seed failed:', error);
    } finally {
        await pool.end();
    }
};

seed();
