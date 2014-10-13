angular.module('admin', [])
.controller('adminCtrl', ['$scope', '$http', function($scope, $http) {
	$scope.myData = {};
	$scope.userModal = false;
	$scope.newUser = false;
	$scope.mask = false;
	
	/*Closes the mask div and any open modals*/
	$scope.myData.maskClick = function($item,$event){
		$scope.userModal = false;
		$scope.newUser = false;
		$scope.mask = false;
	}
	
	/*Retrieves a list of all users
	 And differentiates between permission types, so instead of looking like 1 or 2, it's Adminstrator or User
	*/
	var res = $http.get("scripts/core.php?act=getUsers");
	res.success(function(data,status,headers,config){
		var result = [];
		angular.forEach(data,function(k,v){
			var inner = {};
			angular.forEach(k,function(a,b){
				if(b == "PERM"){
					if(parseInt(a) == 1){
						inner[b] = "Administrator";
					} else {
						inner[b] = "User";
					}
				} else {
					inner[b] = a;
				}
			});
			result.push(inner);
		});
		$scope.users = result;

	});
	
	/*Clears out the modal form and opens it up for editing or adding */
	$scope.myData.addNew = function($item,$event){
		$scope.uname = "";
		$scope.name = "";
		$scope.pass = "";
		$scope.conf = "";
		$scope.type = "";
		$scope.userModal = false;
		$scope.mask = true;
		$scope.newUser = true;
	}
	
	/*Shuts down the modal and mask*/
	$scope.myData.cancelNew = function($item,$event){
		$scope.newUser = false;
		$scope.mask = false;
	}
	$scope.myData.editCancel = function($item,$event){
		$scope.userModal = false;
		$scope.mask = false;
	}
	
	/*Opens up the modal and relevant info to populate the modal form*/
	$scope.myData.editUser = function($item,$event){
		var res = $http.get("scripts/core.php?act=getUser&uid="+$event.target.id);
		res.success(function(data,status,headers,config){
			$scope.uname = data.UNAME;
			$scope.name = data.NAME;
			$scope.type = data.PERM;
			$scope.uid = data.UID;
		});
		$scope.newUser = false;
		$scope.mask = true;
		$scope.userModal = true;
	}
	
	/*Deletes a user and refreshes the data*/
	$scope.myData.userDel = function($item,$event){
		
		var res = $http.get("scripts/core.php?act=userDel&uid="+$event.target.id);
		res.success(function(data,status,headers,config){
			/*This checks the PERM field to see if you're a user or Admin and makes it prettier than just 1 or 2*/
			var result = [];
			angular.forEach(data,function(k,v){
				var inner = {};
				angular.forEach(k,function(a,b){
					if(b == "PERM"){
						if(parseInt(a) == 1){
							inner[b] = "Administrator";
						} else {
							inner[b] = "User";
						}
					} else {
						inner[b] = a;
					}
				});
				result.push(inner);
			});
			$scope.users = result;
		});
		
		$scope.userModal = false;
		$scope.mask = false;
	}
	
	/*Adds a user, updates data and another instance of making 1 or 2 look like Admin or User*/
	$scope.myData.addNewUser = function($item,$event){
		var user = $http.get("scripts/core.php?act=checkUser&uname="+$scope.uname);
		user.success(function(data,status,headers,config){
			if(parseInt(data) == 1){
				$scope.msg = "User already exists";
			} else {
				if($scope.pass == $scope.conf){
					var pass = "";
					if($scope.pass != null){
						pass = calcMD5($scope.pass);
					}
					var res = $http.get("scripts/core.php?act=newUser&uname="+$scope.uname+"&name="+$scope.name+"&pass="+pass+"&type="+$scope.type);
					res.success(function(data,status,headers,config){
						var resp = $http.get("scripts/core.php?act=getUsers");
						resp.success(function(data,status,headers,config){
							var result = [];
							angular.forEach(data,function(k,v){
								var inner = {};
								angular.forEach(k,function(a,b){
									if(b == "PERM"){
										if(parseInt(a) == 1){
											inner[b] = "Administrator";
										} else {
											inner[b] = "User";
										}
									} else {
										inner[b] = a;
									}
								});
								result.push(inner);
							});
							$scope.users = result;
						});
						$scope.newUser = false;
						$scope.mask = false;
					});
				} else {
					$scope.pass = "";
					$scope.confirm = "";
					$scope.msg = "Passwords do not match";
				}
			}
		});
	}
	
	/*Edits a current user*/
	$scope.myData.userSave = function($item,$event){
		if($scope.pass == $scope.confirm){
			var pass = "";
			if($scope.pass != null){
				pass = calcMD5($scope.pass);
			}
			var res = $http.get("scripts/core.php?act=editUser&uid="+$event.target.id+"&name="+$scope.name+"&pass="+pass+"&type="+$scope.type);
			res.success(function(data,status,headers,config){
				var resp = $http.get("scripts/core.php?act=getUsers");
				resp.success(function(data,status,headers,config){
					var result = [];
					angular.forEach(data,function(k,v){
						var inner = {};
						angular.forEach(k,function(a,b){
							if(b == "PERM"){
								if(parseInt(a) == 1){
									inner[b] = "Administrator";
								} else {
									inner[b] = "User";
								}
							} else {
								inner[b] = a;
							}
						});
						result.push(inner);
					});
					$scope.users = result;
				});
				$scope.userModal = false;
				$scope.mask = false;
			});
		} else {
			$scope.pass = "";
			$scope.confirm = "";
			$scope.editmsg = "Passwords do not match";
		}
	}
	
}]).controller('SessionController', ['$scope','$http', function($scope,$http){
	/*This checks the session to find out info about the user and the user's permissions
	If the session isn't available, you get shot back out to the login screen*/

	$scope.res = "";
	var responsePromise = $http.get("scripts/core.php?act=chkSess");
		
	responsePromise.success(function(data, status, headers, config) {
		var name = data['name'];
		if(parseInt(data['user']) > 0){
			$scope.res = "You are logged in as "+name;
		} else {
			window.location.href = "index.html";
		}
		
		if(parseInt(data['perm']) != 1){
			window.location.href = "home.html";
		}
		
		var responsePromise = $http.get("scripts/core.php?act=chkSess");
	
	});
	
	$scope.myData = {};
	/*kills the session*/
	$scope.myData.logout = function($item,$event){
		var responsePromise = $http.get("scripts/core.php?act=logout");
		
		responsePromise.success(function(data, status, headers, config){
			window.location.href="index.html";
		});
	}
	
	$scope.myData.goBack = function($item,$event){
		window.location.href = "home.html";
	}
	
}])
