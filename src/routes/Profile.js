import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";
import { authService, dbService, storageService } from "fbase";
import react, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { v4 as uuidv4 } from "uuid";

const Profile = ({ userObject, refreshUser }) => {
	const history = useHistory();
	const [newDisplayName, setNewDisplayName] = useState(userObject.displayName);
	const [newPhotoURL, setNewPhotoURL] = useState(userObject.photoURL);

	const onLogOutClick = () => {
		authService.signOut();
		history.push("/");
	};

	// to see only your tweets
	const getMyTweets = async () => {
		const tweets = await dbService
			.collection("tweets")
			.where("creatorId", "==", userObject.uid)
			.orderBy("createdAt", "desc")
			.get();
		console.log(tweets.docs.map((doc) => doc.id));
		console.log(tweets.docs.map((doc) => doc.data().creatorImgUrl));
	};

	useEffect(() => {
		getMyTweets();
	}, []);

	const onSubmit = async (event) => {
		event.preventDefault();
		if (userObject.displayName !== newDisplayName) {
			await userObject.updateProfile({
				displayName: newDisplayName,
			});
			// console.log(userObject)
			refreshUser();
		}
		if (userObject.photoURL !== newPhotoURL) {
			let imgFileUrl = "";
			try {
				await storageService.refFromURL(userObject.photoURL).delete();
				// ref(): Returns a reference for the given path in the default bucket.
				// child(): Returns a reference to a relative path from this reference.
				const imgFileRef = storageService
					.ref()
					.child(`${userObject.uid}/${uuidv4()}`);
				// putString(): Uploads string data to this reference's location.
				// returns UploadTaskSnapshot if succeeded
				const response = await imgFileRef.putString(newPhotoURL, "data_url");
				// UploadTaskSnapshot.ref.getDownloadURL()
				imgFileUrl = await response.ref.getDownloadURL();

				await userObject.updateProfile({
					photoURL: imgFileUrl,
				});
			} catch {
				// ref(): Returns a reference for the given path in the default bucket.
				// child(): Returns a reference to a relative path from this reference.
				const imgFileRef = storageService
					.ref()
					.child(`${userObject.uid}/${uuidv4()}`);
				// putString(): Uploads string data to this reference's location.
				// returns UploadTaskSnapshot if succeeded
				const response = await imgFileRef.putString(newPhotoURL, "data_url");
				// UploadTaskSnapshot.ref.getDownloadURL()
				imgFileUrl = await response.ref.getDownloadURL();

				await userObject.updateProfile({
					photoURL: imgFileUrl,
				});
			}
			console.log(userObject);
			refreshUser();
			//해당 if문의 경우 사진이 변경 되었으므로 유저의 프사정보를 트윗에도 함께 업데이트 해줘야함
			//트윗 콜렉션 불러서 WHERE, MAP 써서 일일이 변경
			const tweets = await dbService
				.collection("tweets")
				.where("creatorId", "==", userObject.uid)
				.orderBy("createdAt", "desc")
				.get();
			// appliedTweets는 해당 유저의 게시물의 아이디를 갖는 배열
			const appliedTweets = tweets.docs.map((doc) => doc.id);
			// 게시물 아이디의 작성자 프사 정보를 전부 수정
			appliedTweets.forEach((element) => {
				dbService.doc(`tweets/${element}`).update({
					creatorImgUrl: imgFileUrl,
				});
			});
		}

		history.push("/");
	};

	const onChange = (event) => {
		const {
			target: { value },
		} = event;
		setNewDisplayName(value);
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
			setNewPhotoURL(result);
		};
	};

	return (
		<div className="container">
			<form onSubmit={onSubmit} className="profileForm">
				<input
					onChange={onChange}
					type="text"
					placeholder="Change your name"
					value={newDisplayName}
					className="formInput"
					autoFocus
				/>
				<label style={{ color: "#04aaff", marginTop: 10 }}>
					<span>Change profile photos</span>
				</label>
				<input
					type="file"
					accept="image/*"
					onChange={onFileChange}
					className="formBtn"
					style={{ marginTop: 10, height: 27, paddingBottom: 3 }}
				/>
				<input
					type="submit"
					value="Update user profile"
					className="formBtn"
					style={{
						marginTop: 10,
						marginBottom: 10,
					}}
				/>
			</form>
			<span className="formBtn cancelBtn logOut" onClick={onLogOutClick}>
				Log Out
			</span>
		</div>
	);
};
export default Profile;
