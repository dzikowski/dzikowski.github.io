
var canbanApp = angular.module('kanbanApp', []);

canbanApp.controller('TasksCtrl', ['$scope', 'taskService', function ($scope, taskService) {
  
	$scope.tasks = {};

	taskService.onUpdate(function(task) {
		$scope.tasks[task._id] = task;
		$scope.$apply();
	});

	$scope.create = function() {
		if ($scope.name) {
			taskService.create({ name: $scope.name, status: 'todo' });
			$scope.name = '';
		}
	};

	$scope.setStatus = function(task, status) {
		task.status = status;
		taskService.update(task);
	};
	
	$scope.remove = function(task) {
		taskService.remove(task);
	}
  
}]);

canbanApp.filter('statusFilter', function() {
	return function(input, status) {
		
		if(!status) {
			return input;
		}
		
		var result = [];

		angular.forEach(input, function(task) {
			if(task.status == status) {
				result.push(task);
			}
		});
		return result;
	}
});

canbanApp.factory('taskService', ['pouchdb', function(pouchdb){
	return {
		
		update: function(task) {
			pouchdb.save(task);
		},
		
		create: function(task) {
			task._id = new Date().getTime().toString();
			pouchdb.save(task);
		},
		
		remove: function(task) {
			pouchdb.remove(task);
		},
		
		onUpdate: function(callback) {
			pouchdb.onUpdate(callback);
		}
	}
}]);

canbanApp.factory('pouchdb', function() {
	
	var db = new PouchDB('pouchdb-eventstore-1');

	return {
		
		save: function(obj) {
			obj._id = obj._id.toString();
			db.put(obj);
		},
		
		remove: function(obj) {
			db.remove(obj);
		},
		
		onUpdate: function(updateCallback) {
			db.changes({ live: true, include_docs: true }).on('change', function(change) {
				if (change.doc && updateCallback) {
					updateCallback(change.doc);
				}
			});
		}
	}
});