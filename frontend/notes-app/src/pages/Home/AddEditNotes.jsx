import React, { useState } from 'react';
import TagInput from '../../components/Input/TagInput';
import { MdClose } from 'react-icons/md';
import axiosInstance from '../../utils/axiosInstance';

const AddEditNotes = ({ noteData, type, getAllNotes, onClose, showToastMessage }) => {
    const [title, setTitle] = useState(noteData?.title || "");
    const [content, setContent] = useState(noteData?.content || "");
    const [tags, setTags] = useState(noteData?.tags || []);
    const [error, setError] = useState(null);

    const addNewNote = async (noteData) => {
        try {
            const response = await axiosInstance.post('/add-note', noteData);
            if (response.data && response.data.note) {
                showToastMessage('Note Added Successfully', 'success');
                getAllNotes();
                onClose();
            } else {
                console.log('Failed to add note:', response.data);
            }
        } catch (error) {
            handleError(error);
        }
    };

    const editNote = async (noteData) => {
        try {
            const response = await axiosInstance.put(`/edit-note/${noteData._id}`, noteData);
            if (response.data && response.data.note) {
                showToastMessage('Note Updated Successfully', 'success');
                getAllNotes();
                onClose();
            } else {
                console.log('Failed to edit note:', response.data);
            }
        } catch (error) {
            handleError(error);
        }
    };

    const handleError = (error) => {
        if (error.response && error.response.data && error.response.data.message) {
            setError(error.response.data.message);
        } else {
            setError('An unexpected error occurred. Please try again.');
        }
    };

    const handleAddOrEditNote = () => {
        if (!title) {
            setError('Please enter the title');
            return;
        }
        if (!content) {
            setError('Please enter the content');
            return;
        }
        setError('');

        const noteDataToSend = {
            _id: noteData?._id,
            title,
            content,
            tags
        };

        if (type === 'edit') {
            editNote(noteDataToSend);
        } else {
            addNewNote(noteDataToSend);
        }
    };

    return (
        <div className="relative">
            <button
                className="w-10 h-10 rounded-full flex items-center justify-center absolute -top-3 -right-3 hover:bg-slate-500"
                onClick={onClose}
            >
                <MdClose className="text-xl text-slate-400" />
            </button>

            <div className="flex flex-col gap-2">
                <label className="input-label">TITLE</label>
                <input
                    type="text"
                    className="text-2xl text-slate-950 outline-none"
                    placeholder="Enter your title here, please"
                    value={title}
                    onChange={({ target }) => setTitle(target.value)}
                />
            </div>

            <div className="flex flex-col gap-2 mt-4">
                <label className="input-label">CONTENT</label>
                <textarea
                    className="text-sm text-slate-950 outline-none bg-slate-50 p-2 rounded"
                    placeholder="Content"
                    rows={10}
                    value={content}
                    onChange={({ target }) => setContent(target.value)}
                />
            </div>

            <div className="mt-3">
                <label className="input-label">TAGS</label>
                <TagInput tags={tags} setTags={setTags} />
            </div>

            {error && <p className="text-red-500 text-xs pt-4">{error}</p>}

            <button className="btn-primary font-medium mt-5 p-3" onClick={handleAddOrEditNote}>
                {type === 'edit' ? 'Update' : 'Add'}
            </button>
        </div>
    );
};

export default AddEditNotes;





