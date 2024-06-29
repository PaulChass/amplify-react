import React, { useEffect, useState } from 'react';
import api, { baseUrl } from '../api.js'; // Adjust the path according to your file structure
import CreateFolder from '../components/CreateFolder';
import FileList from '../components/FilesList';
import { useLocation } from 'react-router-dom';
import DownloadFolder from './DownloadFolder';
import DeleteFolder from './DeleteFolder';
import RenameFolder from './RenameFolder';
import CreateShareableLink from './CreateShareableLink';


const FolderTree = () => {
    const [folders, setFolders] = useState([]);
    const [folderId, setFolderId] = useState(null);
    const [folderName, setFolderName] = useState('root');
    const [shareFolderId, setShareFolderId] = useState(null);
    const [shareFolderName, setShareFolderName] = useState('root');
    const [loggedIn, setLoggedIn] = useState(false);
    const [updated, setUpdated] = useState(false);
    const location = useLocation();
    const [showCreateLink, setShowCreateLink] = useState(false);


    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    useEffect(() => {
        fetchFolders();
    }, [folderId, location.pathname, folderName,updated]);

    const fetchFolders = async () => {
        try {
            const response = await api.get(`${baseUrl}/folders/${folderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                withCredentials: true // If sending cookies is necessary
            });
            setFolders(response.data);
            setLoggedIn(true);
            setUpdated(false);
            setShowCreateLink(false);
        } catch (error) {
            console.error('Error fetching folders:', error);
        }
    };


    const handleClick = (id) => {
        setFolderId(id);
        setFolderName(folders.find(folder => folder.id === id).name);
    };

    const handleCreateLinkClick = (id) => {
        if(showCreateLink == true){
            setShowCreateLink(false);} else {
        setShareFolderId(id);
        setShareFolderName(folders.find(folder => folder.id === id).name);
        setShowCreateLink(true);}
    };

    const findParentFolderId = (folders, id) => {
        const folder = folders.find(folder => folder.id === id);
        if (folder) {
            return folder.parent_id
        }
    };

    const handleBackClick = () => {
        const id = findParentFolderId(folders, folderId);
        setFolderId(id);
        if (id === null) {
            setFolderName('root');
        }
        else {
            const folder = folders.find(folder => folder.id === id);
            setFolderName(folder.name);
        } 
    }


    //Check if current folder is root folder
    let isNotRootFolder = true;
    if (folderId === null) { isNotRootFolder = false; }
    for (let index = 0; index < folders.length; index++) {
        if (folders[index].parent_id == folderId && folders[index].parent_id == null) {
            isNotRootFolder = false;
        }
    }


    const renderFolders = (folders) => {
        return folders
            .filter(folder => folder.parent_id === folderId)
            .map(folder => (
                <li key={folder.id}>
                    <button onClick={() => handleClick(folder.id)} >{folder.name}
                    </button>
                    <RenameFolder folderId={folder.id} setFolders={setFolders} setUpdated={setUpdated}/>
                    <DeleteFolder folderId={folder.id} setFolders={setFolders} />
                    <DownloadFolder folderId={folder.id} />
                    <button onClick={() => handleCreateLinkClick(folder.id)}>Share</button>
                </li>
            ));
    };

    if (!loggedIn) {
        return (<div><h2>My drive</h2>
            <p>You need to Sign In to access your drive <a href='/login' style={{ marginLeft: '10px', marginRight: '10px' }} >Sign in</a> <a href='/register'>Register</a></p></div>);
    } else {
        return (
            <div>
                <h2>My drive</h2>
                <h3>{folderName}</h3>
                {isNotRootFolder && <button onClick={() => handleBackClick(folderId)}>...</button>}
                <ul>{renderFolders(folders)}
                    <CreateFolder setFolders={setFolders} folderId={folderId} />

                </ul>
                <FileList folderId={folderId} isNotRootFolder={isNotRootFolder} />

                {showCreateLink && <CreateShareableLink folderId={shareFolderId} folderName={shareFolderName} />}

            </div>
        );
    }
};

export default FolderTree;