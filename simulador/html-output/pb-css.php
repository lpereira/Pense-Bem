<?php
header('Content-Type: text/css');
?>
body {
<?php
        $patterns = array('063.gif', '070.gif', '074.gif', '120.gif', 
                          '148.gif', '156.gif', '157.gif')
?>
        background: darkslategray url('patterns/<?php echo $patterns[array_rand($patterns)]?>');
        margin: 0;
        padding: 0;
}
#faq {
        position: absolute;
        top: 50px;
        left: 50px;
        right: 50px;
        bottom: 50px;
        padding: 20px;
        overflow: auto;
        background: lightgray;
        display: none;
}
#faq h1, #faq h2, #faq h3 {
        font-family: "Arial Rounded MT", helvetica;
}
#faq p, #faq small {
        font-family: helvetica;
}
#menu {
        padding: 10px;
        background: white;
        position: absolute;
        bottom: 0;
        right: 0;
        font-size: 3em;
}
#menu a {
        text-decoration: none;
}
#shadow {
        display: none;
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        top: 0;
        background-color: rgba(20, 20, 20, 0.5);
}
#pb-container {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        right: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
}
