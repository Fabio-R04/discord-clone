import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { SketchPicker, ColorResult } from "react-color";
import LogoutIcon from "../components/svg/LogoutIcon";
import CloseIcon from "../components/svg/CloseIcon";
import EditIcon from "../components/svg/EditIcon";
import EmojiIcon from "../components/svg/EmojiIcon";
import OnlineIcon from "../components/svg/OnlineIcon";
import toast from "react-hot-toast";
import { editProfile } from "../features/auth/authSlice";
import Spinner from "../components/Spinner";
import ConfirmLogout from "../components/ConfirmLogout";
const profileContext = require.context("../assets/default-profile-pictures", true);

interface ProfileFormData {
    displayName: string;
    pronouns: string;
}

export interface ProfileData {
    removeImage: boolean;
    displayName?: string;
    pronouns?: string;
    bannerColor?: string;
    aboutMe?: string;
    file?: File;
}

function ProfileSettings() {
    const [confirmLogout, setConfirmLogout] = useState<boolean>(false);
    const [colorPickerActive, setColorPickerActive] = useState<boolean>(false);
    const [removeActive, setRemoveActive] = useState<boolean>(false);
    const [isRemoved, setIsRemoved] = useState<boolean>(false);
    const [file, setFile] = useState<File | null>(null);
    const [blobURL, setBlobURL] = useState<string>("");
    const [bannerColor, setBannerColor] = useState<string>("");
    const [aboutMe, setAboutMe] = useState<string>("");
    const [profileData, setProfileData] = useState<ProfileFormData>({
        displayName: "",
        pronouns: ""
    });
    const {
        user,
        loadingAuthEdit
    } = useAppSelector((state) => state.auth);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            setBannerColor(user.bannerColor);
            setAboutMe(user.aboutMe);
            setProfileData({
                displayName: user.displayName,
                pronouns: user.pronouns
            });

            if (user.hasProfilePicture.present) {
                setRemoveActive(true);
            }
        }
    }, [user]);

    const handleProfileDataChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
        const { name, value } = event.target;
        setProfileData((prevState: ProfileFormData) => {
            return {
                ...prevState,
                [name]: value
            }
        });
    }

    const handleBannerColorChange = (color: ColorResult): void => {
        setBannerColor(color.hex);
    }

    const handleAboutMeChange = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
        setAboutMe(event.target.value);
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        if (event.target.files) {
            if (!event.target.files[0].type.includes("image")) {
                toast.error("File must be an image.");
                return;
            }

            const url: string = URL.createObjectURL(event.target.files[0]);
            setBlobURL(url);
            setFile(event.target.files[0]);
            setRemoveActive(true);
        }
    }

    const resetChanges = (): void => {
        setProfileData({
            displayName: user?.displayName!,
            pronouns: user?.pronouns!
        });
        setBannerColor(user?.bannerColor!);
        setAboutMe(user?.aboutMe!);
        setBlobURL("");
        setFile(null);
        if (user?.hasProfilePicture.present) {
            setRemoveActive(true);
        } else {
            setRemoveActive(false);
        }
        setIsRemoved(false);
    }

    const saveChanges = (): void => {
        dispatch(editProfile({
            removeImage: isRemoved,
            displayName: profileData.displayName,
            pronouns: profileData.pronouns,
            aboutMe,
            bannerColor,
            file: file || undefined
        }));
    }

    return (
        <>
            <div className="profile-settings">
                <nav className="profile-settings__navigation">
                    <p className="profile-settings__navigation-heading">
                        User Settings
                    </p>
                    <div className="profile-settings__navigation-links">
                        <div className="profile-settings__navigation-links__link profile-settings__navigation-links__link-active">
                            <p>My Account</p>
                        </div>
                        <div onClick={() => setConfirmLogout(true)} className="profile-settings__navigation-links__link">
                            <p>Log Out</p>
                            <LogoutIcon />
                        </div>
                    </div>
                </nav>
                <div className="profile-settings__content">
                    <div className="profile-settings__content-heading">
                        <p className="profile-settings__content-heading__title">My Account</p>
                        <div onClick={() => navigate(-1)} className="profile-settings__content-heading__exit">
                            <div>
                                <CloseIcon />
                            </div>
                            <p>ESC</p>
                        </div>
                    </div>
                    <div className="profile-settings__content-details">
                        <form className="profile-settings__content-details__form">
                            <div className="profile-settings__content-details__form-field">
                                <label htmlFor="display-name">DISPLAY NAME</label>
                                <input
                                    type="text"
                                    name="displayName"
                                    id="display-name"
                                    placeholder={user?.displayName}
                                    value={profileData.displayName}
                                    onChange={handleProfileDataChange}
                                />
                            </div>
                            <hr className="profile-settings__content-details__form-divider" />
                            <div className="profile-settings__content-details__form-field">
                                <label htmlFor="pronouns">PRONOUNS</label>
                                <input
                                    type="text"
                                    name="pronouns"
                                    id="pronouns"
                                    placeholder="Add your pronouns"
                                    value={profileData.pronouns}
                                    onChange={handleProfileDataChange}
                                />
                            </div>
                            <hr className="profile-settings__content-details__form-divider" />
                            <div className="profile-settings__content-details__form-field">
                                <label htmlFor="banner-color">BANNER COLOR</label>
                                <div onClick={() => setColorPickerActive(!colorPickerActive)} className="profile-settings__content-details__form-field__banner" style={{ backgroundColor: bannerColor }}>
                                    <EditIcon />
                                </div>
                                {colorPickerActive && (
                                    <SketchPicker
                                        color={bannerColor}
                                        onChangeComplete={handleBannerColorChange}
                                    />
                                )}
                            </div>
                            <hr className="profile-settings__content-details__form-divider" />
                            <div className="profile-settings__content-details__form-field">
                                <label htmlFor="about-me">ABOUT ME</label>
                                <p>You can use markdown and links if you'd like.</p>
                                <div className="profile-settings__content-details__form-field__about">
                                    <textarea
                                        value={aboutMe}
                                        onChange={handleAboutMeChange}
                                        maxLength={190}
                                        minLength={0}
                                        className="profile-settings__content-details__form-field__about-edit"
                                    />
                                    <div className="profile-settings__content-details__form-field__about-info">
                                        <EmojiIcon />
                                        <p>{190 - aboutMe.length}</p>
                                    </div>
                                </div>
                            </div>
                        </form>
                        <div className="profile-settings__content-details__preview">
                            <p className="profile-settings__content-details__preview-heading">
                                PREVIEW
                            </p>
                            <div className="profile-settings__content-details__preview-content">
                                <div style={{ backgroundColor: bannerColor }} className="profile-settings__content-details__preview-content__banner"></div>
                                <div className="profile-settings__content-details__preview-content__profile">
                                    {(file && blobURL) ? (
                                        <img
                                            src={blobURL}
                                            alt="Profile"
                                        />
                                    ) : (
                                        (user?.hasProfilePicture.present && !isRemoved) ? (
                                            <img
                                                src={`${process.env.REACT_APP_SERVER_URL}/images/${user?.hasProfilePicture.image}`}
                                                alt="Profile"
                                            />
                                        ) : (
                                            <img
                                                src={profileContext(`./discord${user?.hasProfilePicture.color.toLowerCase()}.png`)}
                                                alt="Profile"
                                            />
                                        )
                                    )}
                                    <div onClick={() => {
                                        if (removeActive) {
                                            setFile(null);
                                            setBlobURL("");
                                            setIsRemoved(true);
                                            setRemoveActive(false);
                                        } else {
                                            const fileInput: HTMLInputElement = document.querySelector("#profile-settings__file") as HTMLInputElement;
                                            fileInput.value = "";
                                            fileInput.click();
                                        }
                                    }}>
                                        {removeActive ? (
                                            <p>Remove</p>
                                        ) : (
                                            <EditIcon />
                                        )}
                                    </div>
                                    <div>
                                        <OnlineIcon />
                                    </div>
                                    <input
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.gif"
                                        id="profile-settings__file"
                                        onChange={handleFileChange}
                                        hidden={true}
                                    />
                                </div>
                                <div className="profile-settings__content-details__preview-content__details">
                                    <div className="profile-settings__content-details__preview-content__details-container">
                                        <p className="profile-settings__content-details__preview-content__details-name">{profileData.displayName}</p>
                                        <p className="profile-settings__content-details__preview-content__details-username">{user?.username}</p>
                                        <p className="profile-settings__content-details__preview-content__details-pronouns">{profileData.pronouns}</p>
                                        <hr className="profile-settings__content-details__preview-content__details-divider" />
                                        <div className="profile-settings__content-details__preview-content__details-about">
                                            <p>ABOUT ME</p>
                                            <p>{aboutMe}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="profile-settings__content-buttons">
                            <button onClick={resetChanges} className="profile-settings__content-buttons__reset">Reset</button>
                            <button onClick={saveChanges} className="profile-settings__content-buttons__save">
                                {loadingAuthEdit ? (
                                    <Spinner
                                        absolute={false}
                                        height="1.8rem"
                                        width="1.8rem"
                                    />
                                ) : (
                                    "Save Changes"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {confirmLogout && (
                <ConfirmLogout
                    setConfirmLogout={setConfirmLogout}
                />
            )}
        </>
    )
}

export default ProfileSettings;