import { authService } from "fbase";
import react, { useState } from "react";

const AuthForm = () => {
	const [error, setError] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [newAccount, setNewAccount] = useState(false);
	const [isRecruiter, setIsRecruiter] = useState(false);

	const onChange = (event) => {
		console.log(event.target.name);
		// console.log(event.target.value);
		const {
			target: { name, value },
		} = event;
		console.log(value);
		if (name === "email") {
			setEmail(value);
		} else if (name === "password") {
			setPassword(value);
		}
	};

	const onSubmit = async (event) => {
		event.preventDefault();
		try {
			let data;
			if (newAccount) {
				// create account
				data = await authService.createUserWithEmailAndPassword(
					email,
					password
				);
			} else if (isRecruiter) {
				data = await authService.signInWithEmailAndPassword(email, password);
			} else {
				// login
				data = await authService.signInWithEmailAndPassword(email, password);
			}
			console.log(data);
		} catch (error) {
			setError(error.message);
		}
	};
	const toggleAccount = () => setNewAccount((prev) => !prev);

	const toggleRecruiter = () => {
		setIsRecruiter((prev) => !prev);
		setEmail("test123@asdf.com");
		setPassword("123456");
		if (isRecruiter) {
			alert("Recruiter Mode On! Click Sign In button.");
		}
	};

	return (
		<>
			<form onSubmit={onSubmit} className="container">
				<input
					className="authInput"
					onChange={onChange}
					name="email"
					type="email"
					placeholder="Email"
					required
					value={email}
				></input>
				<input
					className="authInput"
					onChange={onChange}
					name="password"
					type="password"
					placeholder="Password"
					required
					value={password}
				></input>
				<input
					className="authInput authSubmit"
					type="submit"
					value={newAccount ? "Create Account" : "Sign In"}
				></input>
				{error && <span className="authError">{error}</span>}
			</form>
			<span className="authSwitch" onClick={toggleAccount}>
				{newAccount ? "I Have Account" : "I Don't Have Account"}
			</span>
			<span className="authSwitch" onClick={toggleRecruiter}>
				{isRecruiter ? "Click Sign In Button" : "Click If You Are Recruiter"}
			</span>
		</>
	);
};

export default AuthForm;
