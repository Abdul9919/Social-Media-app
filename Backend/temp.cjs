const { publishToQueue } = require('./queue/producer.js');
const {connectQueue} = require('./queue/connection.js');

const posts = [
  {
    postId: 6,
    media_url: "https://res.cloudinary.com/dv9af2izq/image/upload/v1751351784/posts/3f8330c6736c982837e7c037b8c08362_2_2025-07-01.png",
    description: "testing the route"
  },
  {
    postId: 7,
    media_url:"https://res.cloudinary.com/dv9af2izq/video/upload/v1751351971/posts/2cc0aaa9548ccc95c291369daa4ddfb1_2_2025-07-01.mp4",
    description: "testing the route"
  },
  {
    postId: 8,
    media_url: "https://res.cloudinary.com/dv9af2izq/image/upload/v1751355682/posts/6e6448b7fb9c347dd0357cd19dcc7a52_2_2025-07-01.png",
    description: "testing the route again"
  },
  {
    postId: 10,
    media_url: "https://res.cloudinary.com/dv9af2izq/image/upload/v1751554602/posts/edf6277280b3d6be43ef4f8e05ce92cb_3_2025-07-03.png",
    description: "post number 5"
  },
  {
    postId: 12,
    media_url: "https://res.cloudinary.com/dv9af2izq/image/upload/v1751555231/posts/64e570fa82b3a0a46a88458f55406561_3_2025-07-03.png",
    description: "post number 7"
  },
  {
    postId: 13,
    media_url: "https://res.cloudinary.com/dv9af2izq/image/upload/v1776238283/posts/82ac47c5f1acee729af1804dac4592e5_2_2026-04-15.jpg",
    description: "Testing the create post feature"
  },
  {
    postId: 22,
    media_url: "https://res.cloudinary.com/dv9af2izq/video/upload/v1776750074/posts/085e5e3746f7e2a87a889d7204d67033_2_2026-04-21.mp4",
    description: "That is how it is in our weddings lmao"
  },
  {
    postId: 23,
    media_url: "https://res.cloudinary.com/dv9af2izq/video/upload/v1776750283/posts/92d48e9ac7fd0b775ca7b015bb6e2f95_2_2026-04-21.mp4",
    description: ""
  },

]


async function run() {
    try {
        // 1. MUST call your connection logic first!
        // Assuming you have a function that establishes the connection
        await connectQueue(); 

        console.log("Connected to RabbitMQ...");

        // 2. Now you can safely publish
        for (const post of posts) {
            await publishToQueue('postTags-queue', post);
            console.log(`Message for Post ID ${post.postId} sent!`);
        }

        console.log("Message sent!");
        
        // Give it a second then exit
        setTimeout(() => process.exit(0), 1000);
    } catch (error) {
        console.error("Script failed:", error);
        process.exit(1);
    }
}

run();