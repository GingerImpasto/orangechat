import React, { useState } from "react";
import "../styles/ProfileModal.css"; // Styles for the ProfileModal

interface ProfileModalProps {
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ onClose }) => {
  const [firstName, setFirstName] = useState("John");
  const [lastName, setLastName] = useState("Doe");
  const [profileImage, setProfileImage] = useState(
    "https://via.placeholder.com/150"
  );

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    console.log("Saving changes...");
    console.log("First Name:", firstName);
    console.log("Last Name:", lastName);
    console.log("Profile Image:", profileImage);
    onClose(); // Close the modal after saving
  };

  const handleCancel = () => {
    console.log("Canceling changes...");
    onClose(); // Close the modal without saving
  };

  const handleDeleteAccount = () => {
    console.log("Account deletion requested");
    // Add logic to delete the account
  };

  return (
    <div className="profile-modal-overlay">
      <div className="profile-modal">
        <div className="profile-modal-header">
          <h2>Edit Profile</h2>
        </div>
        <div className="profile-modal-content">
          <div className="profile-image-section">
            <img src={profileImage} alt="Profile" className="profile-image" />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="image-upload"
            />
          </div>
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <button
              className="delete-account-button"
              onClick={handleDeleteAccount}
            >
              Delete Account
            </button>
          </div>
          <div className="modal-actions">
            <button className="cancel-button" onClick={handleCancel}>
              Cancel
            </button>
            <button className="save-button" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
