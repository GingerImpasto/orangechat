import React, { useState, useRef } from "react";
import "../styles/ProfileModal.css"; // Styles for the ProfileModal
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faTrash } from "@fortawesome/free-solid-svg-icons";
import { UserType } from "../types";
import { useAuth } from "../context/AuthContext";
import { stringToColor, getInitials } from "../utils/imageDisplay";
import { useNavigate } from "react-router";

interface ProfileModalProps {
  loggedUser: UserType | null;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ onClose, loggedUser }) => {
  const { setUser, token, logout } = useAuth();

  const [firstName, setFirstName] = useState(
    loggedUser ? loggedUser.firstName : ""
  );
  const [lastName, setLastName] = useState(
    loggedUser ? loggedUser.lastName : ""
  );
  const [profileImage, setProfileImage] = useState(
    loggedUser && loggedUser.profileImageUrl ? loggedUser.profileImageUrl : null
  );

  const [isDeleteConfirmationVisible, setIsDeleteConfirmationVisible] =
    useState(false);
  const [typedEmail, setTypedEmail] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Random background color for initials
  const backgroundColor = stringToColor(loggedUser ? loggedUser.firstName : "");

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

  const handleRemoveImage = () => {
    setProfileImage(null); // Reset to default placeholder
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("userId", loggedUser ? loggedUser.id : ""); // Replace with the actual user ID
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append(
        "currentImageUrl",
        loggedUser ? loggedUser.profileImageUrl : ""
      ); // Pass the current image URL

      // Append the image file only if a new one is selected
      if (fileInputRef.current?.files?.[0]) {
        formData.append("profileImage", fileInputRef.current.files[0]);
      } else if (!profileImage) {
        // If the image is reset to the default placeholder, send null
        formData.append("profileImage", ""); // Send an empty value to indicate removal
      }

      // Send a POST request to the Express server
      const response = await fetch(`/home/profileUpdate`, {
        method: "POST",
        body: formData, // No need to set Content-Type header for FormData
      });

      if (!response.ok) {
        throw new Error("Failed to save profile data");
      }

      const result = await response.json();
      console.log("Profile updated successfully:", result);
      if (loggedUser) {
        loggedUser.profileImageUrl = result.profileImageUrl;
      }

      setUser(loggedUser);
      // Close the modal after saving
      onClose();
    } catch (error) {
      console.error("Error saving profile data:", error);

      // Handle the error safely
      if (error instanceof Error) {
        alert(`Failed to save profile data: ${error.message}`);
      } else {
        alert("Failed to save profile data. Please try again.");
      }
    }
  };

  const handleCancel = () => {
    console.log("Canceling changes...");
    setIsDeleteConfirmationVisible(false); // Reset delete confirmation
    setTypedEmail("");
    onClose(); // Close the modal without saving
  };

  const handleDeleteAccount = async () => {
    console.log("Account deletion requested");

    setIsDeleting(true);
    try {
      // Call the backend delete endpoint
      const response = await fetch(`/home/${loggedUser?.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      // Sign out after successful deletion
      setIsDeleting(false);
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Account deletion error:", error);
      alert("Failed to delete account. Please try again.");
    } finally {
    }
  };

  return (
    <div className="profile-modal-overlay">
      <div className="profile-modal">
        {!isDeleteConfirmationVisible ? (
          <>
            <div className="profile-modal-header">
              <h2>Edit Profile</h2>
            </div>
            <div className="profile-modal-content">
              <div className="profile-image-section">
                <div className="profile-image-container">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={`${loggedUser?.firstName} ${loggedUser?.lastName}`}
                      className="profile-image"
                    />
                  ) : (
                    <div
                      style={{
                        width: "100px",
                        height: "100px",
                        borderRadius: "50%",
                        backgroundColor,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: "12px",
                        color: "#fff",
                      }}
                    >
                      {getInitials(
                        loggedUser ? loggedUser.firstName : "",
                        loggedUser ? loggedUser.lastName : ""
                      )}
                    </div>
                  )}
                  <div
                    className="image-picker-icon"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FontAwesomeIcon icon={faCamera} />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    ref={fileInputRef}
                    style={{ display: "none" }}
                  />
                </div>
                <button
                  className="remove-image-button"
                  onClick={handleRemoveImage}
                >
                  <FontAwesomeIcon icon={faTrash} /> Remove Image
                </button>
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
              <div className="modal-actions">
                <button
                  className="delete-account-button"
                  onClick={() => setIsDeleteConfirmationVisible(true)}
                >
                  Delete Account
                </button>
                <button className="cancel-button" onClick={handleCancel}>
                  Cancel
                </button>
                <button className="save-button" onClick={handleSave}>
                  Save
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="confirm-deletion-container">
            {/* Delete Confirmation */}
            <h2 style={{ marginTop: "0px" }}>Confirm Deletion</h2>
            <div className="warning-box">
              <p className="warning-message">
                Are you sure you want to delete your account? You will lose all
                your contacts and data if you choose to do so. Type your email
                to confirm.
              </p>
              <input
                type="email"
                placeholder="Enter your email"
                value={typedEmail}
                onChange={(e) => setTypedEmail(e.target.value)}
                required
              />
            </div>
            <div className="modal-actions-confirm">
              <button
                onClick={() => handleDeleteAccount()}
                className="delete-account-button"
                disabled={typedEmail !== loggedUser?.email || isDeleting} // Disable if emails don't match
              >
                {isDeleting ? "Deleting..." : "Yes, Delete my Account"}
              </button>
              <button
                onClick={() => setIsDeleteConfirmationVisible(false)}
                className="cancel-confirm-button"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileModal;
