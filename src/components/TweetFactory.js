import { dbService, storageService } from "fbase";
import react, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";

const TweetFactory = ({ userObject }) => {
	const [tweet, setTweet] = useState("");
	const [img, setImg] = useState("");

	const onSubmit = async (event) => {
		if (tweet === "") {
			return;
		}
		event.preventDefault();
		let imgFileUrl = "";
		// if user uploading tweet with image,
		if (img !== "") {
			// ref(): Returns a reference for the given path in the default bucket.
			// child(`${userObject.uid}/${uuidv4()}`): 차일드안의 parameter는 유저의 아이디가 폴더 이름인 버켓을 만들기 위해
			// -> 각 폴더는 유저 아이디 때문에 유니크함.
			const imgFileRef = storageService
				.ref()
				.child(`${userObject.uid}/${uuidv4()}`);
			// putString(): Uploads string data to this reference's location.
			// returns UploadTaskSnapshot if succeeded
			const response = await imgFileRef.putString(img, "data_url");
			// UploadTaskSnapshot.ref.getDownloadURL()
			imgFileUrl = await response.ref.getDownloadURL();
		}

		const addTweet = {
			text: tweet,
			createdAt: Date.now(),
			creatorId: userObject.uid,
			imgFileUrl,
			creatorImgUrl: userObject.photoURL,
		};

		await dbService.collection("tweets").add(addTweet);
		//clean the tweet after adding it.
		setTweet("");
		setImg("");
		console.log(addTweet);
	};

	const onChange = (event) => {
		// inside the event, inside the target, get the value
		const {
			target: { value },
		} = event;
		setTweet(value);
	};
	console.log(userObject);

	const onFileChange = (event) => {
		const {
			target: { files },
		} = event;
		const imgFile = files[0];
		const reader = new FileReader();
		reader.readAsDataURL(imgFile);
		//This onloadend is triggered each time the reading operation is completed
		reader.onloadend = (finishedEvent) => {
			const {
				currentTarget: { result },
			} = finishedEvent;
			setImg(result);
			console.log(result);
		};
	};

	const onClearPhoto = () => {
		setImg("");
	};

	return (
		<form onSubmit={onSubmit} className="factoryForm">
			<div className="factoryInput__container">
				<input
					className="factoryInput__input"
					value={tweet}
					onChange={onChange}
					type="text"
					placeholder="What's on your mind?"
					maxLength={120}
				/>
				<input type="submit" value="&rarr;" className="factoryInput__arrow" />
			</div>
			<label htmlFor="attach-file" className="factoryInput__label">
				<span>Add photos</span>
				<FontAwesomeIcon icon={faPlus} />
			</label>
			<input
				id="attach-file"
				type="file"
				accept="image/*"
				onChange={onFileChange}
				style={{
					opacity: 0,
				}}
			/>
			{/* <input value={tweet} onChange={onChange} type="text" placeholder="Write your message" maxLength={120}/>
            <input onChange={onFileChange} type="file" accept="image/*"/>
            <input type="submit" value="Tweet"/> */}
			{img && (
				<div className="factoryForm__attachment">
					<img
						alt="attached file"
						src={img}
						style={{
							backgroundImage: img,
						}}
					/>
					<div className="factoryForm__clear" onClick={onClearPhoto}>
						<span>Remove</span>
						<FontAwesomeIcon icon={faTimes} />
					</div>
				</div>
			)}
		</form>
	);
};

export default TweetFactory;
