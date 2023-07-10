import react, { useEffect, useState } from "react";
import { dbService, storageService } from "fbase";
import Tweet from "components/Tweet";
import TweetFactory from "components/TweetFactory";

const Home = ({ userObject }) => {
	const [tweets, setTweets] = useState([]);

	// const getTweets = async () => {
	//     const tweetsData = await dbService.collection("tweets").get();
	//     tweetsData.forEach(document => console.log(document.data()));
	//     tweetsData.forEach((document) => {
	//         // ...(spread operator) unfolds the attributes inside the object or array
	//         const tweetObject = {
	//             ...document.data(),
	//             id: document.id,
	//         };
	//         //prev is former value, tweetObject is the new value.
	//         //in order to preserve all values, this function put new value in front,
	//         //and attach(append) prior values on the tail by using ,...prev
	//         //iterate this for every document, finally get all data inside tweets array.
	//         setTweets(prev => [tweetObject, ...prev]);
	//     });
	// }

	// useEffect -> whenever components mount or update, I want to do this.
	useEffect(() => {
		// getTweets();
		dbService
			.collection("tweets")
			.orderBy("createdAt", "desc")
			.onSnapshot((snapshot) => {
				// each doc inside the docs will be return as an object
				// then put it into the tweetArray
				console.log(snapshot);
				const tweetArray = snapshot.docs.map((doc) => ({
					// doc.id is an auto generated id when the document made.
					id: doc.id,
					...doc.data(),
				}));
				// console.log(tweetArray);
				setTweets(tweetArray);
				console.log(tweetArray);
			});
	}, []);

	return (
		<div className="container">
			<TweetFactory userObject={userObject} />
			<div style={{ marginTop: 30 }}>
				{tweets.map((tweet) => (
					<Tweet
						key={tweet.id}
						userObject={userObject}
						tweetObject={tweet}
						isOwner={tweet.creatorId === userObject.uid}
					></Tweet>
				))}
			</div>
		</div>
	);
};

export default Home;
