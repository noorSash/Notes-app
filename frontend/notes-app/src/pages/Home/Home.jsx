import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import NoteCard from '../../components/Cards/NoteCard';
import moment from 'moment';
import { MdAdd } from "react-icons/md";
import AddEditNotes from './AddEditNotes';
import Modal from 'react-modal';
import axiosInstance from '../../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import Toast from '../../components/ToastMessage/Toast';
import EmptyCard from '../../components/EmptyCard/EmptyCard'; 
import AddNotesImg from "../../assets/images/add-notes.svg"; 
import NoDataImg from "../../assets/images/no-data.svg"; 

const Home = () => {
  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShow: false,
    type: "add",
    data: null,
  });
  const [showToastMes, setShowToastMes] = useState({
    isShown: false,
    message: "",
    type: ""
  });

  const [allNotes, setAllNotes] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [isSearch, setIsSearch] = useState(false);

  const navigate = useNavigate();

  const handleEdit = (noteDetails) => {
    setOpenAddEditModal({
      isShow: true, 
      data: noteDetails, 
      type: "edit"
    });
  };

  const showToastMessage = (message, type) => {
    setShowToastMes({
      isShown: true,
      message: message,
      type: type
    });
    setTimeout(() => {
      setShowToastMes({
        isShown: false,
        message: "",
        type: ""
      });
    }, 3000);
  };

  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get("/get-user");
      if (response.data && response.data.user) {
        setUserInfo(response.data.user);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.clear();
        navigate("/login");
      } else {
        console.error("An unexpected error occurred:", error);
        showToastMessage("An error occurred while fetching user info.", "error");
      }
    }
  };

  const getAllNotes = async () => {
    try {
      const response = await axiosInstance.get("/get-all-notes");
      if (response.data && response.data.notes) {
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      console.error("An unexpected error occurred while fetching notes:", error);
      showToastMessage("An error occurred while fetching notes.", "error");
    }
  };

  const deleteNote = async (noteId) => {
    try {
      const response = await axiosInstance.delete(`/delete-note/${noteId}`);
      if (response.data && !response.data.error) {
        showToastMessage('Note Deleted Successfully', 'delete');
        getAllNotes();
      } else {
        showToastMessage(response.data.message || 'Failed to delete note', 'error');
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleError = (error) => {
    if (error.response && error.response.data && error.response.data.message) {
      showToastMessage(error.response.data.message, 'error');
    } else {
      showToastMessage('An unexpected error occurred. Please try again.', 'error');
    }
  };

  const onSearchNote = async (query) => {
    if (!query) {
      setIsSearch(false);
      getAllNotes();
      return;
    }
    try {
      const response = await axiosInstance.get("/search-notes", { params: { query } });
      if (response.data && response.data.notes) {
        setIsSearch(true);
        setAllNotes(response.data.notes);
      } else {
        showToastMessage("No notes found for the search query", "info");
        setAllNotes([]);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const updateIsPinned = async (noteData) => {
    const noteId = noteData._id;
    try {
      const updatedNoteData = { ...noteData, isPinned: !noteData.isPinned };
      const response = await axiosInstance.put(`/update-note-pinned/${noteId}`, updatedNoteData);
      if (response.data && response.data.note) {
        showToastMessage('Note Updated Successfully', 'success');
        getAllNotes();
      } else {
        showToastMessage('Failed to update note', 'error');
      }
    } catch (error) {
      console.error("An error occurred while updating the note:", error);
      handleError(error);
    }
  };



  const handleClearSearch = () => {
    setIsSearch(false);
    getAllNotes();
  };

  useEffect(() => {
    getAllNotes();
    getUserInfo();
  }, []);

  return (
    <>
      <Navbar userInfo={userInfo} onSearchNote={onSearchNote} handleClearSearch={handleClearSearch}  />
      <div className="container mx-auto p-4 border-b">
        {allNotes.length > 0 ? (
          <div className="grid grid-cols-3 gap-4 mt-8">
            {allNotes.map((item) => (
              <NoteCard 
                key={item._id}
                title={item.title}
                date={moment(item.createdOn).format('MMMM DD, YYYY')}
                content={item.content}
                tags={item.tags}
                isPinned={item.isPinned}
                onEdit={() => handleEdit(item)}
                onDelete={() => deleteNote(item._id)}
                onPinNote={() => updateIsPinned(item)}
              />
            ))}
          </div>
        ) : (
          <EmptyCard 
            imgSrc={isSearch ? NoDataImg : AddNotesImg} 
            message={isSearch ? 'Oops! No notes found matching your search.' : "Start creating your first note! Click the 'Add' button to jot down your thoughts, ideas, and reminders. Let's get started!"}
          />
        )}
      </div>
      <button 
        className="w-16 h-16 flex items-center justify-center rounded-2xl bg-primary hover:bg-blue-600 absolute right-10 bottom-10"
        onClick={() => setOpenAddEditModal({ isShow: true, type: "add", data: null })}
        aria-label="Add note"
      >
        <MdAdd className="text-[32px] text-white" />
      </button>
      <Modal 
        isOpen={openAddEditModal.isShow}
        onRequestClose={() => setOpenAddEditModal({ isShow: false, type: "add", data: null })}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2)",
          },
        }}
        contentLabel="Add/Edit Note"
        className="w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5"
      >
        <AddEditNotes
          type={openAddEditModal.type}
          noteData={openAddEditModal.data}
          onClose={() => setOpenAddEditModal({ isShow: false, type: "add", data: null })}
          getAllNotes={getAllNotes}
          showToastMessage={showToastMessage}
        />
      </Modal>
      <Toast
        isShown={showToastMes.isShown}
        message={showToastMes.message}
        type={showToastMes.type}
        onClose={() => setShowToastMes({ isShown: false, message: "", type: "" })}
      />
    </>
  );
};

export default Home;










