"use client";

import GeminiAPI from "../../components/AIAssistant/GeminiAPI";
import { Content } from "@google/generative-ai";
import Image from "next/image";
import React, {
	ChangeEvent,
	MouseEventHandler,
	useEffect,
	useRef,
	useState,
} from "react";
import questionsList from "@/data/questionsList.json";
import AIRoles from "./AIRoles";
import languagesList from "@/data/languages.json";
import { AnimatePresence, motion } from "framer-motion";

interface QuestionListTypes {
	title: string;
	prompts: {
		text: string;
	}[];
}

export default function AIComponent({
	handleOpenAIAssistant,
}: {
	handleOpenAIAssistant: MouseEventHandler<HTMLButtonElement>;
}) {
	const {
		AIChatbotSystem,
		historyResp,
		error,
		loading,
		setSystemLanguage,
		systemLanguage,
	} = GeminiAPI();

	const [prompt, setPrompt] = useState<string>("");
	const [closePrePrompts, setClosePrePrompts] = useState<boolean>(false);
	const [showLanguageList, setShowLanguageList] = useState<boolean>(false);
	const [languageSearch, setLanguageSearch] = useState("");

	const ChatBoxRef = useRef<HTMLDivElement | null>(null);

	const handlePromptChange = (
		e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
	): void => {
		setPrompt(e.target.value);
	};

	const handlePrePrompts = (text: string) => {
		setPrompt(text);
		setClosePrePrompts(true);
	};

	const handleClosePrePrompts = () => {
		setClosePrePrompts(!closePrePrompts);
	};

	const handlePrompt = async () => {
		setClosePrePrompts(true);

		if (prompt) {
			await AIChatbotSystem(prompt);
			setPrompt("");
		}
	};

	useEffect(() => {
		ChatBoxRef.current?.scrollTo({
			top: ChatBoxRef.current?.scrollHeight,
			left: 0,
			behavior: "smooth",
		});
	}, [loading]);

	const handleSetSystemLanguage = (language: string) => {
		setSystemLanguage(language);
		setLanguageSearch("");
		setShowLanguageList(false);
	};

	const handleLanguageChange = () => {
		setShowLanguageList(!showLanguageList);
	};

	useEffect(() => {
		const closeModal = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			if (!target.closest(".language-change")) {
				setShowLanguageList(false);
				setLanguageSearch("");
			}
		};

		document.addEventListener("mousedown", closeModal);
		return () => document.removeEventListener("mousedown", closeModal);
	}, []);

	const handleLanguageSearch = (e: ChangeEvent<HTMLInputElement>): void => {
		setLanguageSearch(e.target.value);
	};

	return (
		<>
			<div className="fixed bottom-0 right-0 w-full border-t-4 h-full mt-auto bg-gradient-to-tr bg-[rgba(255,255,255,0.9)] backdrop-blur-xl z-[60] flex flex-col justify-center items-center">
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1, zIndex: 60, height: "100%", width: "100%" }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.3 }}
				>
					<div className="ai-assistant-modal w-[90%] lg:w-[700px] h-full px-10 py-5 flex flex-col justify-start items-start gap-1 md:hover:bg-gray-100 transition-colors relative mx-auto">
						<div className="flex flex-col sm:flex-row gap-2 justify-start sm:justify-between items-between sm:items-center w-full">
							<div className="flex flex-row justify-between items-center gap-1">
								<h1 className="lato-bold">AI Assistant Chatbot</h1>

								<button
									onClick={handleOpenAIAssistant}
									className="ai-assistant-modal no-style-btn block sm:hidden"
								>
									<Image
										className="h-auto min-w-[25px] max-w-[25px]"
										src={"/icons/close.svg"}
										alt="icon"
										width={25}
										height={25}
									/>
								</button>
							</div>

							<div className="w-full sm:w-fit h-fit flex flex-row justify-center items-center gap-5">
								<div className="w-full sm:w-fit h-fit relative flex justify-center items-center">
									<button
										onClick={() => {
											handleLanguageChange();
										}}
										className="language-change no-style-btn flex flex-row gap-1 justify-center items-center py-3 ml-auto"
									>
										<p className="text-sm text-gray-400">{systemLanguage}</p>
										<Image
											className="h-auto min-w-[25px] max-w-[25px]"
											src={"/icons/translate.svg"}
											alt="icon"
											width={25}
											height={25}
										/>
									</button>

									{showLanguageList && (
										<div className="language-change absolute top-10 right-0 bg-white border shadow-xl px-4 py-2 rounded-xl w-[200px] sm:w-[250px] h-fit z-10">
											<div className="flex flex-col gap-1 w-full justify-start items-start pb-1">
												<h1 className="lato-bold">Choose a Language:</h1>

												<input
													className="input-field-style w-full border text-sm"
													type="text"
													placeholder="Search Language"
													onChange={handleLanguageSearch}
													value={languageSearch}
												/>
											</div>

											<div className="flex flex-col justify-start items-start default-overflow overflow-y-scroll overflow-x-hidden w-full max-h-[200px]">
												{languagesList.languages.map(
													(language: string, index: number) => {
														if (
															language
																.normalize("NFD")
																.replace(/\p{Diacritic}/gu, "")
																.toLowerCase()
																.includes(languageSearch.toLowerCase())
														) {
															return (
																<React.Fragment key={index}>
																	<button
																		onClick={() => {
																			handleSetSystemLanguage(language);
																		}}
																		className="no-style-btn"
																	>
																		{language}
																	</button>
																</React.Fragment>
															);
														}
													}
												)}

												{languagesList.languages
													.filter((language: string) =>
														language
															.normalize("NFD")
															.replace(/\p{Diacritic}/gu, "")
															.toLowerCase()
															.includes(languageSearch.toLowerCase())
													)
													.map((language: string) => language).length < 1 && (
													<>
														<p className="text-gray-400">Language Not Here</p>
													</>
												)}
											</div>
										</div>
									)}
								</div>

								<button
									onClick={handleOpenAIAssistant}
									className="ai-assistant-modal no-style-btn hidden sm:block"
								>
									<Image
										className="h-auto min-w-[25px] max-w-[25px]"
										src={"/icons/close.svg"}
										alt="icon"
										width={25}
										height={25}
									/>
								</button>
							</div>
						</div>

						<div
							ref={ChatBoxRef}
							className="flex flex-col w-full h-full justify-start items-start gap-5 default-overflow overflow-x-hidden overflow-y-scroll relative"
						>
							{historyResp &&
								historyResp?.map((value: Content) => value).length < 1 && (
									<div className="flex flex-col justify-center items-center text-center absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
										<p className="text-gray-400">
											Ask anything about the ETM Foundation.
										</p>
									</div>
								)}

							{historyResp
								?.filter(
									(value: Content) =>
										!value.parts
											.map((part) => part.text)
											.toString()
											.includes("9jd&3vd%")
								)
								?.map((conversation: Content) => (
									<AIRoles
										key={conversation.parts.map((part) => part.text).toString()}
										conversation={conversation}
									/>
								))}
						</div>

						<div className="flex flex-col w-full h-auto gap-2 pt-3 text-sm">
							{error && (
								<p
									onClick={handleClosePrePrompts}
									className="text-white bg-red-500 px-4 py-2 rounded-xl w-full"
								>
									{error}
								</p>
							)}

							{loading && (
								<p className="w-full text-center animate-pulse text-lg text-gray-500">
									Typing...
								</p>
							)}

							<button
								onClick={handleClosePrePrompts}
								className="outlined-styled-btn"
							>
								{closePrePrompts ? "Show Prompts" : "Hide Prompts"}
							</button>

							<AnimatePresence>
								{closePrePrompts === false && (
									<div className="default-overflow overflow-y-scroll overflow-x-hidden w-full max-h-[200px]">
										<motion.div
											initial={{ opacity: 0, maxHeight: "0px" }}
											animate={{ opacity: 1, zIndex: 60, maxHeight: "200px" }}
											exit={{ opacity: 0, maxHeight: "0px" }}
											transition={{ duration: 0.3 }}
										>
											{questionsList.map(
												(question: QuestionListTypes, index: number) => {
													return (
														<div
															className="flex flex-col w-full justify-start items-start pt-5"
															key={index}
														>
															<h1 className="text-xl lato-bold">
																{question.title}
															</h1>

															<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 w-full py-2">
																{question.prompts.map(
																	(
																		prePrompt: { text: string },
																		index: number
																	) => {
																		return (
																			<React.Fragment key={index}>
																				<button
																					onClick={() =>
																						handlePrePrompts(prePrompt.text)
																					}
																					className="no-style-btn !bg-white border rounded-xl p-2"
																				>
																					{prePrompt.text}
																				</button>
																			</React.Fragment>
																		);
																	}
																)}
															</div>
														</div>
													);
												}
											)}
										</motion.div>
									</div>
								)}
							</AnimatePresence>
						</div>

						<div className="flex flex-row gap-1 w-full h-auto mt-auto py-1 relative">
							{loading ? (
								<>
									<textarea
										disabled
										className="input-field-style block md:hidden border min-h-[45px] h-[45px] max-h-[150px] overflow-y-auto opacity-30 cursor-not-allowed"
										placeholder="Write Prompt..."
										onChange={(e) => handlePromptChange(e)}
										value={prompt}
									/>

									<input
										disabled
										className="input-field-style hidden md:block border overflow-y-auto opacity-30 cursor-not-allowed"
										placeholder="Write Prompt..."
										onKeyDown={(e) => e.key === "Enter" && handlePrompt()}
										onChange={(e) => handlePromptChange(e)}
										value={prompt}
									/>

									<button
										disabled
										onClick={handlePrompt}
										className="styled-btn w-fit text-center h-fit opacity-30 hover:!opacity-40 !cursor-not-allowed"
									>
										Send
									</button>
								</>
							) : (
								<>
									<textarea
										className="input-field-style block md:hidden border min-h-[45px] h-[45px] max-h-[150px] overflow-y-auto"
										placeholder="Write Prompt..."
										onChange={(e) => handlePromptChange(e)}
										value={prompt}
									/>

									<input
										className="input-field-style hidden md:block border overflow-y-auto"
										placeholder="Write Prompt..."
										onKeyDown={(e) => e.key === "Enter" && handlePrompt()}
										onChange={(e) => handlePromptChange(e)}
										value={prompt}
									/>

									<button
										onClick={handlePrompt}
										className="styled-btn w-fit text-center h-fit"
									>
										Send
									</button>
								</>
							)}
						</div>

						<p className="text-[12px] text-gray-500 mx-auto text-center">
							This is an experimental generative AI chatbot. AI can make
							mistakes.
						</p>
					</div>
				</motion.div>
			</div>
		</>
	);
}
