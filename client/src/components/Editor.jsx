import { Box } from '@mui/material'
import { useEffect, useState } from 'react'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import styled from '@emotion/styled'
import { io } from 'socket.io-client'
import {useParams} from 'react-router-dom'
let count=0;

const Component = styled.div`
    background: #F5F5F5
`

var toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
    ['blockquote', 'code-block'],

    [{ 'header': 1 }, { 'header': 2 }],               // custom button values
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
    [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
    [{ 'direction': 'rtl' }],                         // text direction

    [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

    [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
    [{ 'font': [] }],
    [{ 'align': [] }],

    ['clean']                                         // remove formatting button
];

const Editor = () => {

    const [socket, setSocket] = useState();
    const [quill, setQuill] = useState();
    const {id} = useParams();


    useEffect(() => {
        console.log("Hello from 1 useEffect");
        const quillServer = new Quill('#container', {
            theme: 'snow',
            modules: {
                toolbar: toolbarOptions,
            }
        });
        quillServer.disable();
        quillServer.setText('Loading the document ...');
        setQuill(quillServer)
    }, []);

    useEffect(() => {
        const socketServer = io('')
        setSocket(socketServer)
        return () => {
            socketServer.disconnect();
        }
    }, [])


    useEffect(() => {
        console.log("Hello from 3 useEffect");
        if (!quill && !socket) return;

        const handleChange = (delta, oldDelta, source) => {
            if (source !== 'user') return;

            socket && socket.emit('send-changes', delta)
        }

        quill && quill.on('text-change', handleChange);

        return () => {
            quill && quill.off('text-change', handleChange);
        }
    }, [quill])

    useEffect(() => {
        console.log("Hello from 4 useEffect");
        if (!quill && !socket) return;

        const handleChange = (delta) => {
            quill.updateContents(delta);
        }
         socket && socket.on('receive-changes', handleChange);

        return () => {
            quill && quill.off('receive-changes', handleChange);
        }

    }, [quill])

    useEffect(() => {
        console.log("Hello from 5 useEffect");
        if (!quill && !socket) return;

        socket && socket.emit('get-document',id);

        socket.once('load-document', document => {
            console.log("Hello from load-document");
            quill && quill.setContents(document);
            quill && quill.enable();
        })

        
    }, [quill])
    

    useEffect(() => {
        if (!quill && !socket) return;

        const interval = setInterval(() => {
            socket.emit('save-document',quill.getContents())
        }, 2000);

        return ()=>{
            clearInterval(interval)
        }
    }, [quill])
    


    return (
        <Component>
            <Box className='container' id="container"></Box>
        </Component>
    )
}

export default Editor