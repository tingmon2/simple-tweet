import { dbService, storageService } from "fbase";
import react, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faTrash,
	faPencilAlt,
	faImage,
} from "@fortawesome/free-solid-svg-icons";
import { v4 as uuidv4 } from "uuid";

const Tweet = ({ userObject, tweetObject, isOwner }) => {
	const [editing, setEditing] = useState(false);
	const [newTweet, setNewTweet] = useState(tweetObject.text);
	const [seeImage, setSeeImage] = useState(false);
	const [img, setImg] = useState("");
	const [editPhoto, setEditPhoto] = useState(false);

	const onDeleteClick = async () => {
		const ok = window.confirm("Are you sure?");
		if (ok) {
			// doc = documentReference
			// it is like path on the file system(explorer)
			await dbService.doc(`tweets/${tweetObject.id}`).delete();
			if (tweetObject.imgFileUrl !== "") {
				await storageService.refFromURL(tweetObject.imgFileUrl).delete();
			}
		}
	};

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
		};
		setEditPhoto(true);
	};

	const toggleEditing = () => setEditing((prev) => !prev);

	const toggleImage = () => setSeeImage((prev) => !prev);

	const onChange = (event) => {
		const {
			target: { value },
		} = event;
		setNewTweet(value);
	};

	const onSubmit = async (event) => {
		event.preventDefault();
		if (editPhoto) {
			let imgFileUrl = "";
			if (img !== "") {
				// ref(): Returns a reference for the given path in the default bucket.
				// child(): Returns a reference to a relative path from this reference.
				const imgFileRef = storageService
					.ref()
					.child(`${userObject.uid}/${uuidv4()}`);
				// putString(): Uploads string data to this reference's location.
				// returns UploadTaskSnapshot if succeeded
				const response = await imgFileRef.putString(img, "data_url");
				// UploadTaskSnapshot.ref.getDownloadURL()
				imgFileUrl = await response.ref.getDownloadURL();
			}
			// console.log(tweetObject.text, newTweet);
			// A DocumentReference refers to a document location in a Firestore database
			// go to your firestore, you can see the location
			// ex) /tweets/6x3GyJ3AnvvxmwsClP2t
			dbService.doc(`tweets/${tweetObject.id}`).update({
				text: newTweet,
				imgFileUrl,
			});
		} else {
			dbService.doc(`tweets/${tweetObject.id}`).update({
				text: newTweet,
			});
		}
		setEditPhoto(false);
		setEditing(false);
		setSeeImage(false);
	};
	// console.log("is owner:" + isOwner);
	// console.log(userObject);
	// console.log(userObject.photoURL);
	// console.log(tweetObject)

	return (
		<div className="nweet">
			{editing ? (
				<>
					{isOwner && (
						<>
							<form onSubmit={onSubmit} className="container nweetEdit">
								<input
									onChange={onChange}
									type="text"
									value={newTweet}
									required
									autoFocus
									className="formInput"
								></input>
								<label style={{ color: "#04aaff", marginTop: 10 }}>
									<span>Change profile photos</span>
								</label>
								<input
									type="file"
									accept="image/*"
									onChange={onFileChange}
									className="formBtn"
									style={{ marginTop: 10, height: 30, paddingBottom: 3 }}
								/>
								<input type="submit" value="Update Tweet" className="formBtn" />
							</form>
							<span onClick={toggleEditing} className="formBtn cancelBtn">
								Cancel
							</span>
						</>
					)}
				</>
			) : seeImage ? (
				<>
					{
						<>
							{/* <form onSubmit={onSubmit} className="container nweetEdit">
                            <input onChange={onChange} type="text" value={newTweet} required autoFocus className="formInput"></input>
                            <input type="submit" value="Update Tweet" className="formBtn" />
                        </form>  */}
							<div className="container nweetEdit">
								{tweetObject.imgFileUrl ? (
									<img
										className="tweetUploadedIamge"
										src={tweetObject.imgFileUrl}
										alt="your uploaded photo"
									/>
								) : (
									<>
										<span
											className="authError"
											style={{ marginBottom: 10, fontSize: 15 }}
										>
											User didn't upload photo for this tweet
										</span>
									</>
								)}
							</div>
							<span onClick={toggleImage} className="formBtn cancelBtn">
								Minimize
							</span>
						</>
					}
				</>
			) : (
				<>
					<h4>{tweetObject.text}</h4>
					{tweetObject.creatorImgUrl && (
						<img
							className="tweetProfileImage"
							alt="no file"
							src={tweetObject.creatorImgUrl}
						/>
					)}
					{isOwner ? (
						<>
							<div className="nweet__actions">
								<span onClick={onDeleteClick}>
									<FontAwesomeIcon icon={faTrash} />
								</span>
								<span onClick={toggleEditing}>
									<FontAwesomeIcon icon={faPencilAlt} />
								</span>
								<span onClick={toggleImage}>
									<FontAwesomeIcon icon={faImage} />
								</span>
							</div>
						</>
					) : (
						<>
							<div className="nweet__actions">
								<span onClick={toggleImage}>
									<FontAwesomeIcon icon={faImage} />
								</span>
							</div>
						</>
					)}
				</>
			)}
		</div>
	);
};

export default Tweet;
