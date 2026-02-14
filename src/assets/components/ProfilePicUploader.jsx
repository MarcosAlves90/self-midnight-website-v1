import { useEffect, useContext, useCallback } from 'react';
import imageCompression from 'browser-image-compression';
import { UserContext } from '../../UserContext.jsx';

export default function ProfilePicUploader() {
    const { userData, setUserData } = useContext(UserContext);

    const handleElementChange = useCallback((key) => (value) => {
        setUserData((prevUserData) => ({
            ...prevUserData,
            [key]: value,
        }));
    }, [setUserData]);

    const handlePaste = useCallback(async (event) => {
            const items = event.clipboardData.items;
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const file = items[i].getAsFile();
                    const options = {
                        maxSizeMB: 0.5,
                        maxWidthOrHeight: 150,
                        useWebWorker: false,
                        quality: 0.7,
                        outputFormat: 'image/jpeg',
                    };

                    try {
                        const compressedFile = await imageCompression(file, options);
                        if (compressedFile) {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                                handleElementChange('profilePic')(e.target.result);
                            };
                            reader.readAsDataURL(compressedFile);
                        }
                    } catch (error) {
                        console.error(error);
                    }
                }
            }
        }, [handleElementChange]);

    useEffect(() => {
        window.addEventListener('paste', handlePaste);
        return () => {
            window.removeEventListener('paste', handlePaste);
        };
    }, [handlePaste]);

    const handleFileChange = useCallback(async (event) => {
        const file = event.target.files[0];
        if (file) {
            const options = {
                maxSizeMB: 0.5,
                maxWidthOrHeight: 150,
                useWebWorker: false,
                quality: 0.7,
                outputFormat: 'image/jpeg',
            };

            try {
                const compressedFile = await imageCompression(file, options);
                if (compressedFile) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        handleElementChange('profilePic')(e.target.result);
                    };
                    reader.readAsDataURL(compressedFile);
                }
            } catch (error) {
                console.error(error);
            }
        }
    }, [handleElementChange]);

    return (
        <div className="profile-uploader">
            <label htmlFor="file-upload">
                <img src={userData.profilePic || './images/rgPlaceholder.jpg'} alt="Profile" />
                <div>Upload</div>
            </label>
            <input
                id="file-upload"
                type="file"
                className="profile-uploader__input"
                onChange={handleFileChange}
                accept="image/*"
            />
        </div>
    );
}


