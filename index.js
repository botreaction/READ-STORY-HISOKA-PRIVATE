const express = require('express');
const app = express();
const port = 3000;

import path from 'path';
import { spawn } from 'child_process';
import { watchFile, unwatchFile } from 'fs';
import cfonts from 'cfonts'; 
import treeKill from './lib/tree-kill.js';
import chalk from 'chalk';

let activeProcess = null;

function start(file) {
	// Cetak banner sebelum memulai proses
	console.log(`――――――――――――――――――――――――――――――――――――――――――――――――――――――`);
	try {
		// Cetak banner
		cfonts.say('Bot\n-----------\nAuto\nRead\nStory\n-----------\nByWily', {
			font: 'tiny',
			align: 'center',
			colors: ['cyan', 'magenta'], // Gunakan warna acak
			background: 'transparent',
			letterSpacing: 1,
			lineHeight: 1,
			space: true,
			maxLength: '0',
			gradient: false,
			independentGradient: false,
			transitionGradient: false,
			env: 'node'
		});
	} catch (error) {
		console.error("Error menampilkan cfonts:", error);
	}
	console.log(`――――――――――――――――――――――――――――――――――――――――――――――――――――――`);

	if (activeProcess) {
		treeKill(activeProcess.pid, 'SIGTERM', err => {
			if (err) {
				console.error('Error stopping process:', err);
			} else {
				console.log('Process stopped.');
				activeProcess = null;
				start(file);
			}
		});
	} else {
		// Garis pemisah di atas "Starting . . ."
		console.log(`――――――――――――――――――――――――――――――――――――――――――――――――――――――`); 

		// Warna random
		const colors = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan'];
		const randomColor = colors[Math.floor(Math.random() * colors.length)];

		// Menampilkan "Starting . . ." dengan warna random
		console.log(chalk[randomColor]('Starting . . .')); 

		// Garis pemisah di bawah "Starting . . ."
		console.log(`――――――――――――――――――――――――――――――――――――――――――――――――――――――`); 

		let args = [path.join(process.cwd(), file), ...process.argv.slice(2)];
		let p = spawn(process.argv[0], args, { stdio: ['inherit', 'inherit', 'inherit', 'ipc'] })
			.on('message', data => {
				console.log('[RECEIVED]', data);
				switch (data) {
					case 'reset':
						start(file);
						break;
					case 'uptime':
						p.send(process.uptime());
						break;
				}
			})
			.on('exit', code => {
				console.error('Exited with code:', code);
				if (Number(code) && code === 0) return;
				watchFile(args[0], () => {
					unwatchFile(args[0]);
					start(file);
				});
			});

		activeProcess = p;

		
	}
}

start('hisoka.js');
